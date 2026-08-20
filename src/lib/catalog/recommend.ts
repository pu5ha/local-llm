import type { Model } from "./types";

export interface RecommendationInput {
  ramGB: number;
}

export interface RecommendationResult {
  primary: Model | null;
  alternatives: Model[];
  maxParametersB: number;
}

/**
 * Reserved for the OS, browser, and background apps before any RAM is
 * "available" for a model. Without this, a model's raw Q4 weight size (a
 * few GB even at 8B params) numerically "fits" almost any tier, so the
 * biggest-that-fits rule would recommend the same model at every RAM tier.
 */
export const OS_OVERHEAD_GB = 4;

/**
 * Single source of truth for "given this hardware, what model do we
 * recommend" — replaces the three previously-duplicated implementations in
 * useHardwareDetection.ts, setup/page.tsx, and tiers.ts.
 *
 * Only curated `featured` models are ever candidates — this is the safety
 * gate that keeps auto-refreshed/uncurated models out of recommendations.
 */
export function getRecommendedModel(
  catalog: Model[],
  input: RecommendationInput
): RecommendationResult {
  const effectiveRamGB = Math.max(0, input.ramGB - OS_OVERHEAD_GB);

  const candidates = catalog
    .filter((m) => m.featured && m.ramRequiredGB <= effectiveRamGB)
    .sort((a, b) => b.parametersB - a.parametersB);

  return {
    primary: candidates[0] ?? null,
    alternatives: candidates.slice(1),
    maxParametersB: candidates[0]?.parametersB ?? 0,
  };
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
