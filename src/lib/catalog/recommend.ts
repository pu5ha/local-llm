import { RAM_TIERS_GB, type Model, type RamTierGB } from "./types";

export interface RecommendationInput {
  ramGB: number;
}

export interface RecommendationResult {
  primary: Model | null;
  alternatives: Model[];
  maxParametersB: number;
}

/**
 * Historical name, kept for the one caller that still reasons in "RAM left
 * after the OS". Sizing itself no longer subtracts this — `ramRequiredGB` is
 * now total system RAM needed (see mergeCatalog.ramRequiredFor).
 */
export const OS_OVERHEAD_GB = 4;

/** The tier a given amount of RAM belongs to: the largest tier at or below it. */
export function tierForRam(ramGB: number): RamTierGB | null {
  const eligible = RAM_TIERS_GB.filter((t) => t <= ramGB);
  return eligible.length > 0 ? eligible[eligible.length - 1] : null;
}

/**
 * Single source of truth for "given this hardware, what model do we recommend".
 *
 * Selection is by explicit tier assignment (`recommendedForRamGB`), not derived
 * from parameter counts. Two things forced that: a Mixture-of-Experts model with
 * 3B active params outranks a dense 27B on total params while being a weaker
 * model, and ranking by measured footprint instead lands the 35B MoE at exactly
 * 32GB — which a `<= 32` test admits, so it wins the 32GB tier too and collapses
 * 32GB and 64GB into one answer. Explicit assignment is stable as new models
 * land; `catalog.curatedData.test.ts` asserts each tier's pick actually fits.
 *
 * Only curated `featured` models are ever candidates — the safety gate that
 * keeps auto-discovered models out of recommendations.
 */
export function getRecommendedModel(
  catalog: Model[],
  input: RecommendationInput
): RecommendationResult {
  const featured = catalog.filter((m) => m.featured);
  const tier = tierForRam(input.ramGB);

  const tiered = tier
    ? featured.filter((m) => m.recommendedForRamGB === tier)
    : [];

  // Fall back to "biggest featured model that fits" for catalogs with no tier
  // assignments at all (older snapshots, and the synthetic test fixtures).
  const candidates =
    tiered.length > 0
      ? tiered
      : featured
          .filter((m) => m.ramRequiredGB <= input.ramGB)
          .sort((a, b) => b.ramRequiredGB - a.ramRequiredGB);

  const primary = candidates[0] ?? null;

  const alternatives = featured
    .filter((m) => m.id !== primary?.id && m.ramRequiredGB <= input.ramGB)
    .sort((a, b) => b.ramRequiredGB - a.ramRequiredGB);

  return {
    primary,
    alternatives,
    maxParametersB: primary?.parametersB ?? 0,
  };
}

export interface TierPick {
  ramGB: RamTierGB;
  pick: Model | null;
  /** False when this tier resolves to the same model as a lower tier. */
  isDistinct: boolean;
}

/**
 * The full 8/16/32/64 roster. `isDistinct: false` is reported rather than worked
 * around — if two tiers share a pick that's a genuine gap in the roster for the
 * model-watch pipeline to flag, not something to paper over by recommending a
 * knowingly worse model to the bigger machine.
 */
export function getTierRoster(catalog: Model[]): TierPick[] {
  const seen = new Set<string>();
  return RAM_TIERS_GB.map((ramGB) => {
    const pick = getRecommendedModel(catalog, { ramGB }).primary;
    const isDistinct = pick ? !seen.has(pick.id) : false;
    if (pick) seen.add(pick.id);
    return { ramGB, pick, isDistinct };
  });
}

export interface RamCapabilityFlags {
  canRun4GB: boolean;
  canRun8GB: boolean;
  canRun16GB: boolean;
}

/** Generic RAM-threshold flags, unrelated to any specific model. */
export function getRamCapabilityFlags(ramGB: number): RamCapabilityFlags {
  return {
    canRun4GB: ramGB >= 4,
    canRun8GB: ramGB >= 8,
    canRun16GB: ramGB >= 16,
  };
}
