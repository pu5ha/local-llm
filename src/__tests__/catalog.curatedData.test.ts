import { curatedModels } from "@/lib/catalog/curated";
import { mergeCatalog, ramRequiredFor } from "@/lib/catalog/mergeCatalog";
import { getTierRoster } from "@/lib/catalog/recommend";
import { RAM_TIERS_GB } from "@/lib/catalog/types";

/**
 * Validates the real src/lib/catalog/data/curated.json, not a fixture.
 *
 * This is the gate that makes it safe for scripts/refresh-modelwatch.ts to
 * rewrite that file: a bad automated edit — a model that doesn't fit the tier
 * it's filed under, two models claiming one tier, a malformed Ollama tag —
 * fails here and turns CI red instead of reaching a non-technical user who
 * will act on it by downloading several gigabytes.
 */
describe("curated.json", () => {
  const models = mergeCatalog(curatedModels, [], "fallback-snapshot").models;

  it("has unique ids and Hugging Face join keys", () => {
    const ids = curatedModels.map((m) => m.id);
    const hfIds = curatedModels.map((m) => m.hfModelId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(hfIds).size).toBe(hfIds.length);
  });

  it("has a plausible Ollama tag and HF repo id on every entry", () => {
    for (const m of curatedModels) {
      // family[:tag] — lowercase, no spaces. What the user literally types.
      expect(m.ollamaName).toMatch(/^[a-z0-9._-]+(:[a-z0-9._-]+)?$/);
      expect(m.hfModelId).toMatch(/^[\w.-]+\/[\w.-]+$/);
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("measures rather than estimates every featured model", () => {
    // Estimates run ~10% low against real Q4_K_M downloads and ignore the
    // vision projector, so anything we actively recommend must be measured.
    for (const m of models.filter((x) => x.featured)) {
      expect(m.ramSource).toBe("measured");
      expect(m.weightsGB).toBeGreaterThan(0);
    }
  });

  it("assigns each RAM tier exactly one model", () => {
    for (const tier of RAM_TIERS_GB) {
      const owners = curatedModels.filter((m) => m.recommendedForRamGB === tier);
      expect(owners).toHaveLength(1);
      expect(owners[0].featured).toBe(true);
    }
  });

  it("only lets a tier own a model that actually fits it", () => {
    for (const m of curatedModels) {
      if (!m.recommendedForRamGB) continue;
      expect(ramRequiredFor(m)).toBeLessThanOrEqual(m.recommendedForRamGB);
    }
  });

  it("gives a bigger machine a bigger model", () => {
    // Strict monotonicity up the tiers. This is what stops the roster drifting
    // into either failure mode: two tiers converging on one model, or a large
    // machine being handed something sized for a small one.
    const owners = RAM_TIERS_GB.map(
      (tier) => curatedModels.find((m) => m.recommendedForRamGB === tier)!
    );
    const required = owners.map(ramRequiredFor);
    for (let i = 1; i < required.length; i++) {
      expect(required[i]).toBeGreaterThan(required[i - 1]);
    }
  });

  it("recommends a distinct model at every tier the wizard offers", () => {
    const roster = getTierRoster(models);
    expect(roster.map((r) => r.ramGB)).toEqual([...RAM_TIERS_GB]);
    for (const row of roster) {
      expect(row.pick).not.toBeNull();
      expect(row.isDistinct).toBe(true);
    }
  });

  it("records active parameters for MoE models and leaves dense ones alone", () => {
    for (const m of curatedModels) {
      if (m.activeParametersB === undefined) continue;
      expect(m.activeParametersB).toBeLessThan(m.parametersB);
      expect(m.activeParametersB).toBeGreaterThan(0);
    }
  });
});
