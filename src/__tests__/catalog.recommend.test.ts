import { getRecommendedModel, getRamCapabilityFlags, getTierRoster } from "@/lib/catalog/recommend";
import { lookupVramGB, getAppleSiliconSuggestion } from "@/lib/catalog/hardwareTables";
import type { Model } from "@/lib/catalog/types";

function makeModel(overrides: Partial<Model>): Model {
  return {
    id: "id",
    ollamaName: "name",
    hfModelId: "org/name",
    name: "Name",
    provider: "Test",
    description: "desc",
    bestFor: [],
    quality: "great",
    speed: "fast",
    curatedAt: "2026-01-01",
    parameters: "8B",
    parametersB: 8,
    ramRequiredGB: 13,
    ramRequired: "13GB",
    ramSource: "measured",
    factsSource: "live",
    ...overrides,
  };
}

// ramRequiredGB is TOTAL system RAM the model needs, OS reserve included
// (mergeCatalog.ramRequiredFor), so it's compared against a machine's RAM
// directly with no second subtraction.
describe("getRecommendedModel", () => {
  const catalog: Model[] = [
    makeModel({ id: "small", featured: true, ramRequiredGB: 8, parametersB: 4 }),
    makeModel({ id: "mid", featured: true, ramRequiredGB: 13, parametersB: 8 }),
    makeModel({ id: "big", featured: true, ramRequiredGB: 26, parametersB: 32 }),
    makeModel({ id: "unfeatured-fits", featured: false, ramRequiredGB: 8, parametersB: 4 }),
  ];

  it("only ever recommends featured models", () => {
    const result = getRecommendedModel(catalog, { ramGB: 64 });
    expect(result.primary?.id).not.toBe("unfeatured-fits");
    expect([result.primary, ...result.alternatives].every((m) => m?.featured)).toBe(true);
  });

  it("picks the biggest model that fits", () => {
    const result = getRecommendedModel(catalog, { ramGB: 16 });
    expect(result.primary?.id).toBe("mid");
  });

  it("recommends purely off RAM, with no GPU-based boost", () => {
    // 20GB cannot hold big (needs 26GB), regardless of what GPU is present —
    // useHardwareDetection's x1.5 boost must not leak into model choice.
    const result = getRecommendedModel(catalog, { ramGB: 20 });
    expect(result.primary?.id).toBe("mid");
  });

  it("reserves OS/app overhead so a mid-size model doesn't get recommended at every tier", () => {
    // Entry tier scenario: 8GB total RAM should NOT recommend a model sized for Standard/Power
    const result = getRecommendedModel(catalog, { ramGB: 8 });
    expect(result.primary?.id).toBe("small");
  });

  it("returns null primary when nothing fits", () => {
    const result = getRecommendedModel(catalog, { ramGB: 1 });
    expect(result.primary).toBeNull();
    expect(result.maxParametersB).toBe(0);
  });
});

describe("getRecommendedModel with explicit tier assignments", () => {
  // A Mixture-of-Experts model is the case that broke the old derived rule: 35B
  // total params outranks a dense 27B when sorting by parametersB, and its
  // measured footprint ties the 32GB budget exactly, so a "biggest that fits"
  // rule hands it BOTH the 32GB and 64GB tiers.
  const catalog: Model[] = [
    makeModel({ id: "t8", featured: true, recommendedForRamGB: 8, ramRequiredGB: 8, parametersB: 4 }),
    makeModel({ id: "t16", featured: true, recommendedForRamGB: 16, ramRequiredGB: 13, parametersB: 12 }),
    makeModel({ id: "t32", featured: true, recommendedForRamGB: 32, ramRequiredGB: 26, parametersB: 27 }),
    makeModel({
      id: "t64-moe",
      featured: true,
      recommendedForRamGB: 64,
      ramRequiredGB: 32,
      parametersB: 35,
      activeParametersB: 3,
    }),
  ];

  it("gives each RAM tier a distinct pick", () => {
    const roster = getTierRoster(catalog);
    expect(roster.map((r) => r.pick?.id)).toEqual(["t8", "t16", "t32", "t64-moe"]);
    expect(roster.every((r) => r.isDistinct)).toBe(true);
  });

  it("does not let a high-total-param MoE take the tier below its own", () => {
    expect(getRecommendedModel(catalog, { ramGB: 32 }).primary?.id).toBe("t32");
  });

  it("rounds an in-between RAM amount down to the tier it belongs to", () => {
    expect(getRecommendedModel(catalog, { ramGB: 12 }).primary?.id).toBe("t8");
    expect(getRecommendedModel(catalog, { ramGB: 48 }).primary?.id).toBe("t32");
    expect(getRecommendedModel(catalog, { ramGB: 128 }).primary?.id).toBe("t64-moe");
  });

  it("reports a roster gap instead of silently downgrading a tier", () => {
    const gapped = catalog.filter((m) => m.recommendedForRamGB !== 64);
    const roster = getTierRoster(gapped);
    const top = roster.find((r) => r.ramGB === 64)!;
    // 64GB falls back to the biggest that fits, which is the 32GB pick.
    expect(top.pick?.id).toBe("t32");
    expect(top.isDistinct).toBe(false);
  });
});

describe("getRamCapabilityFlags", () => {
  it("thresholds correctly", () => {
    expect(getRamCapabilityFlags(2)).toEqual({ canRun4GB: false, canRun8GB: false, canRun16GB: false });
    expect(getRamCapabilityFlags(16)).toEqual({ canRun4GB: true, canRun8GB: true, canRun16GB: true });
  });
});

describe("hardwareTables", () => {
  it("looks up current-gen NVIDIA GPUs", () => {
    expect(lookupVramGB("nvidia geforce rtx 5090")).toBe(32);
    expect(lookupVramGB("nvidia geforce rtx 4060")).toBe(8);
    expect(lookupVramGB("some unknown gpu")).toBeNull();
  });

  it("suggests RAM for Apple Silicon by chip family and core count", () => {
    expect(getAppleSiliconSuggestion("apple m5 max", 16).suggestedRamGB).toBe(36);
    expect(getAppleSiliconSuggestion("apple m4", 10).suggestedRamGB).toBe(16);
    expect(getAppleSiliconSuggestion("apple m9 (future chip)", 16).suggestedRamGB).toBe(32);
  });
});
