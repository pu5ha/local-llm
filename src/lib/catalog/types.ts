export type Quality = "excellent" | "great" | "good";
export type Speed = "fast" | "medium" | "slow";

/**
 * The RAM tiers the setup wizard offers (SetupWizard.tsx's RAM buttons). Exactly
 * one curated model carries each value via `recommendedForRamGB` — that is the
 * recommendation, rather than something derived from parameter counts.
 */
export const RAM_TIERS_GB = [8, 16, 32, 64] as const;
export type RamTierGB = (typeof RAM_TIERS_GB)[number];

/**
 * Hand-curated by the site owner. This is the only thing that decides which
 * models get shown as "featured"/recommended to a beginner — never derived
 * or promoted automatically from live data.
 *
 * RAM/parameter sizing is authoritative here (the owner picks a specific
 * model + quantization, which doesn't change), not from live facts — the
 * live source (Hugging Face) only enriches popularity/freshness signals.
 */
export interface CuratedModel {
  id: string; // stable slug, e.g. "llama-3.2-3b" — used in tests/URLs, never changes
  ollamaName: string; // the pullable Ollama tag, e.g. "llama3.2", shown in "ollama run" commands
  hfModelId: string; // Hugging Face repo id, e.g. "meta-llama/Llama-3.2-3B-Instruct" — join key into live facts
  lmStudioName?: string;
  name: string;
  provider: string;
  description: string;
  bestFor: string[];
  quality: Quality;
  speed: Speed;
  featured?: boolean;
  curatedAt: string; // ISO date the owner last reviewed this entry
  parametersB: number; // e.g. 8 — total params. Display + fallback sizing only (see weightsGB)

  /**
   * Measured size of the Ollama model layer for `ollamaName`, in GB, from the
   * registry manifest. Authoritative for sizing when present — the parametersB
   * estimate runs ~10% low against real Q4_K_M downloads and ignores the vision
   * projector layer. Refreshed by scripts/refresh-modelwatch.ts.
   */
  weightsGB?: number;
  /** Active params for Mixture-of-Experts models (e.g. 3 for a 35B-A3B). Display/copy only. */
  activeParametersB?: number;
  /** True when the manifest carries an `image.projector` layer, i.e. it accepts images. */
  visionCapable?: boolean;
  /**
   * The RAM tier this model is *the* recommendation for. At most one model per
   * tier; a model can be `featured` (shown in browse lists) without owning a tier.
   */
  recommendedForRamGB?: RamTierGB;
}

/** Auto-refreshed popularity/freshness facts. Never hand-edited. */
export interface ModelFacts {
  hfModelId: string; // join key
  downloads?: number;
  likes?: number;
  lastModified?: string;
}

export type FactsSource = "live" | "fallback-snapshot" | "missing";

/** What components actually render: curated entry enriched with fresh facts. */
export interface Model extends CuratedModel, Omit<ModelFacts, "hfModelId"> {
  parameters: string; // "8B" display, derived from parametersB
  ramRequiredGB: number; // total system RAM needed — see ramRequiredFor()
  ramRequired: string; // "8GB" display
  ramSource: "measured" | "estimated"; // whether weightsGB backed the number
  factsSource: FactsSource;
}

/** Live HF repos with no curated match — review-only, never featured/recommended. */
export interface UncuratedModel extends ModelFacts {
  name: string; // best-effort display name derived from hfModelId
  firstSeenAt: string;
}

export interface CatalogMeta {
  fetchedAt: string;
  source: "live" | "fallback-snapshot";
  warning?: string;
}

export interface Catalog {
  models: Model[];
  uncurated: UncuratedModel[];
  meta: CatalogMeta;
}

export interface FallbackSnapshot {
  generatedAt: string;
  facts: ModelFacts[];
  uncurated: Array<Omit<UncuratedModel, "name">>;
}
