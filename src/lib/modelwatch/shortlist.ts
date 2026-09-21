import { ramRequiredFor } from "../catalog/mergeCatalog";
import { RAM_TIERS_GB, type CuratedModel, type RamTierGB } from "../catalog/types";
import {
  MIN_HF_DOWNLOADS,
  MIN_UPGRADE_MARGIN,
  MIN_UPGRADE_MARGIN_LOSING_VISION,
} from "./constants";
import type { Candidate, ManifestFacts, Proposal } from "./types";

/**
 * The smallest offered tier a model comfortably fits in, or null if even the
 * largest tier can't hold it. Sizing goes through the same ramRequiredFor the
 * site uses, so the pipeline can never propose a pick the site would then
 * reject — or worse, accept and show to someone whose machine can't run it.
 */
export function fitsTier(candidate: Pick<Candidate, "residentGB">): RamTierGB | null {
  const needed = ramRequiredFor({
    parametersB: 0,
    weightsGB: candidate.residentGB,
  } as CuratedModel);
  return RAM_TIERS_GB.find((tier) => needed <= tier) ?? null;
}

export function toCandidate(
  facts: ManifestFacts,
  extra: Omit<Candidate, keyof ManifestFacts | "ramRequiredGB" | "fitsTier">
): Candidate {
  const ramRequiredGB = ramRequiredFor({
    parametersB: extra.parametersB,
    weightsGB: facts.residentGB,
  } as CuratedModel);
  return {
    ...facts,
    ...extra,
    ramRequiredGB,
    fitsTier: fitsTier(facts),
  };
}

/**
 * Whether a challenger is worth displacing the incumbent for.
 *
 * The bar is deliberately high. This list is hardware advice acted on by
 * downloading several gigabytes, so churning it between near-equivalent models
 * costs readers real time and teaches them the recommendation is arbitrary. A
 * challenger must be a meaningfully bigger model for the same tier, already
 * adopted, and have a resolving HF id.
 */
export function heldBackReasons(
  candidate: Candidate,
  incumbent: CuratedModel | null,
  /** The whole roster, to spot a model that already has a home. */
  roster: CuratedModel[] = []
): string[] {
  const reasons: string[] = [];

  if (candidate.fitsTier === null) {
    reasons.push("too large for any tier we offer");
  }

  // A model already assigned to a tier stays there. fitsTier reports the
  // SMALLEST tier a model squeezes into, which for qwen3.6:35b is 32GB — it
  // needs exactly 32GB and would consume the entire machine. It is curated at
  // 64GB precisely so it has room to breathe, and rediscovering it must not
  // undo that placement and collapse the two tiers into one answer.
  const candidateKey = modelKey(candidate.ollamaName, candidate.parametersB);
  const placed = roster.find(
    (m) =>
      m.recommendedForRamGB !== undefined &&
      modelKey(m.ollamaName, m.parametersB) === candidateKey
  );
  if (placed && placed.recommendedForRamGB !== candidate.fitsTier) {
    reasons.push(
      `already recommended at ${placed.recommendedForRamGB}GB, where it has headroom`
    );
  }
  if (!candidate.hfModelId) {
    reasons.push("no Hugging Face repo id resolved");
  }
  if ((candidate.hfDownloads ?? 0) < MIN_HF_DOWNLOADS) {
    reasons.push(
      `only ${(candidate.hfDownloads ?? 0).toLocaleString()} Hugging Face downloads`
    );
  }

  if (incumbent) {
    const incumbentSize = incumbent.weightsGB ?? incumbent.parametersB * 0.5;
    const losesVision = incumbent.visionCapable === true && !candidate.visionCapable;
    const margin = losesVision
      ? MIN_UPGRADE_MARGIN_LOSING_VISION
      : MIN_UPGRADE_MARGIN;

    // A newer release in the same lineage is exempt from the size margin: a
    // successor is usually the same size as what it replaces (qwen3.6:27b ->
    // qwen3.8:27b), and requiring it to be BIGGER would make the routine
    // version bump — the one case cleared for auto-merge — unreachable.
    const isNewerSameLineage =
      lineage(candidate.ollamaName) === lineage(incumbent.ollamaName) &&
      (familyVersion(candidate.ollamaName) ?? 0) > (familyVersion(incumbent.ollamaName) ?? 0);

    if (!isNewerSameLineage && candidate.residentGB < incumbentSize * margin) {
      reasons.push(
        `not a clear step up from ${incumbent.ollamaName} ` +
          `(${candidate.residentGB}GB vs ${incumbentSize}GB` +
          `${losesVision ? ", and would lose image support" : ""})`
      );
    }
    if (candidate.ollamaName === incumbent.ollamaName) {
      reasons.push("already the current pick");
    }

    // Within one lineage, a lower version number never displaces a higher one.
    // Otherwise qwen3.5:35b (23.87GB) beats qwen3.6:35b (22.62GB) on size and
    // the roster walks backwards a generation.
    if (lineage(candidate.ollamaName) === lineage(incumbent.ollamaName)) {
      const candidateVersion = familyVersion(candidate.ollamaName);
      const incumbentVersion = familyVersion(incumbent.ollamaName);
      if (
        candidateVersion !== null &&
        incumbentVersion !== null &&
        candidateVersion < incumbentVersion
      ) {
        reasons.push(
          `older release than the current pick ` +
            `(${family(candidate.ollamaName)} < ${family(incumbent.ollamaName)})`
        );
      }
    }
  }

  return reasons;
}

/**
 * Picks the best candidate for each tier and diffs it against what's curated
 * now. Returns one proposal per tier that should change; a tier whose
 * incumbent still wins produces nothing, which is what makes a quiet week a
 * genuinely empty diff.
 */
export function proposeRoster(
  current: CuratedModel[],
  candidates: Candidate[]
): Proposal[] {
  const proposals: Proposal[] = [];

  for (const tier of RAM_TIERS_GB) {
    const incumbent = current.find((m) => m.recommendedForRamGB === tier) ?? null;

    const eligible = candidates
      .filter(
        (c) => c.fitsTier === tier && heldBackReasons(c, incumbent, current).length === 0
      )
      // Biggest model the tier can hold wins; ties broken by adoption, then
      // name, so the outcome never depends on fetch order.
      .sort(
        (a, b) =>
          b.residentGB - a.residentGB ||
          (b.hfDownloads ?? 0) - (a.hfDownloads ?? 0) ||
          a.ollamaName.localeCompare(b.ollamaName)
      );

    const winner = eligible[0];
    if (!winner) continue;

    // Lineage, not family: qwen3.6 -> qwen3.8 is the same lineage even though
    // the family names differ, and that distinction is what the risk rules
    // key off.
    const sameLineage =
      incumbent !== null && lineage(winner.ollamaName) === lineage(incumbent.ollamaName);

    proposals.push({
      kind: incumbent ? "retarget-tier" : "add-model",
      tier,
      incumbentId: incumbent?.id ?? null,
      candidate: winner,
      // classifyRisk owns the real decision; this is a placeholder so the
      // type is total.
      risk: "review",
      reasons: [
        incumbent
          ? `${winner.ollamaName} (${winner.residentGB}GB) would replace ` +
            `${incumbent.ollamaName} at ${tier}GB`
          : `${winner.ollamaName} would fill the empty ${tier}GB tier`,
        sameLineage
          ? "same model family as the current pick"
          : "different model family",
        `${(winner.hfDownloads ?? 0).toLocaleString()} Hugging Face downloads`,
      ],
    });
  }

  return proposals;
}

/** The Ollama family prefix: "qwen3.6:27b" -> "qwen3.6". */
export function family(ollamaName: string): string {
  return ollamaName.split(":")[0];
}

/**
 * The model lineage, with the version stripped: "qwen3.6" -> "qwen",
 * "gemma4" -> "gemma", "muse-glimmer" -> "muse-glimmer".
 *
 * This, not `family`, is what "same family" means when deciding whether a
 * change is routine. A new release arrives as a NEW family name — qwen3.6
 * becomes qwen3.7 — so comparing family names would classify every version
 * bump as a family switch and nothing would ever qualify as routine.
 */
export function lineage(ollamaName: string): string {
  return family(ollamaName).replace(/[\d.]+$/, "");
}

/**
 * The version number inside a family name: "qwen3.6" -> 3.6, "gemma4" -> 4.
 * Returns null for unversioned families like "muse-glimmer".
 */
export function familyVersion(ollamaName: string): number | null {
  const m = /([\d.]+)$/.exec(family(ollamaName));
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Identity that survives tag aliases.
 *
 * Ollama publishes the same weights under several tags — qwen3.6:35b,
 * qwen3.6:35b-a3b and qwen3.6:latest are byte-identical (verified: same
 * model-layer digest). Comparing tag strings therefore fails to recognise a
 * model we already recommend.
 *
 * Active parameters are deliberately NOT part of the key: the short alias
 * ("35b") doesn't carry them while the long one ("35b-a3b") does, so
 * including them would split one model into two identities again. A family
 * does not ship two different models at the same total size.
 */
export function modelKey(ollamaName: string, parametersB: number): string {
  return `${family(ollamaName)}|${parametersB}`;
}

/** Size class, so "same size class" is a mechanical test rather than a judgement. */
export function sizeClass(parametersB: number): string {
  if (parametersB < 6) return "tiny";
  if (parametersB < 15) return "small";
  if (parametersB < 24) return "medium";
  if (parametersB < 40) return "large";
  return "xlarge";
}
