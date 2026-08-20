export type Quality = "excellent" | "great" | "good";
export type Speed = "fast" | "medium" | "slow";

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
  parametersB: number; // e.g. 8 — authoritative, drives ramRequiredGB via a Q4 formula
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
  ramRequiredGB: number;
  ramRequired: string; // "8GB" display
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
