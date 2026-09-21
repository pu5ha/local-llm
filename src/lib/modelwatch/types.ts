import type { CuratedModel, RamTierGB } from "../catalog/types";

/** One row of https://ollama.com/library — before we know if it runs locally. */
export interface LibraryEntry {
  /** Family name, e.g. "gemma4". Not a pullable tag on its own. */
  family: string;
  pulls: number;
  /** Parameter-size badges shown on the card, e.g. ["12b", "26b", "31b"]. */
  sizeBadges: string[];
  /** Raw "Updated ..." text; relative, so only used as a coarse staleness signal. */
  updatedText: string;
}

/** Measured facts for one pullable tag, straight from the registry manifest. */
export interface ManifestFacts {
  /** Exactly what a user types after `ollama run`, e.g. "gemma4:12b". */
  ollamaName: string;
  /** The vnd.ollama.image.model layer, in GB. */
  weightsGB: number;
  /** Weights plus the vision projector, which stays resident. Used for sizing. */
  residentGB: number;
  visionCapable: boolean;
}

export interface Candidate extends ManifestFacts {
  family: string;
  pulls: number;
  parametersB: number;
  activeParametersB?: number;
  /** Validated Hugging Face repo id, or null when no guess resolved. */
  hfModelId: string | null;
  hfDownloads?: number;
  hfLikes?: number;
  /**
   * ISO date the Hugging Face repo was last modified. This, not Ollama's
   * "Updated" text, is the real release-recency signal: Ollama's field changes
   * when the packaging is refreshed, so qwen3.6 read as "2 weeks ago" while
   * the model itself predates qwen3.8 by four months.
   */
  hfLastModified?: string;
  license?: string;
  /** Approximate days since the family was last updated, from the listing. */
  ageDays?: number;
  /** Total system RAM this needs, via catalog ramRequiredFor. */
  ramRequiredGB: number;
  /** The tier it could own: the smallest offered tier it fits in. */
  fitsTier: RamTierGB | null;
}

export type ProposalKind =
  | "add-model"
  | "retarget-tier"
  | "facts-only"
  | "unavailable";

export type Risk = "low" | "review" | "blocked";

export interface Proposal {
  kind: ProposalKind;
  tier: RamTierGB | null;
  /** id of the curated entry being replaced, when there is one. */
  incumbentId: string | null;
  candidate: Candidate;
  risk: Risk;
  /** Human-readable justification, shown in the PR body and Telegram message. */
  reasons: string[];
}

export type WatchStatus = "ok" | "degraded";

export interface WatchReport {
  generatedAt: string;
  status: WatchStatus;
  /** Why the run is degraded; empty when status is "ok". */
  degradedReasons: string[];
  librarySize: number;
  candidateCount: number;
  proposals: Proposal[];
  /** Overall risk: the worst risk across proposals. Drives commit vs PR. */
  risk: Risk;
  /** Tiers where two RAM tiers resolve to the same model — a roster gap. */
  tierGaps: RamTierGB[];
}

/** Committed audit trail. Volatile counts are bucketed to keep diffs quiet. */
export interface WatchSnapshot {
  generatedAt: string;
  status: WatchStatus;
  tiers: Array<{
    ramGB: RamTierGB;
    ollamaName: string | null;
    ramRequiredGB: number | null;
  }>;
  watching: Array<{
    ollamaName: string;
    pullsBucket: string;
    ramRequiredGB: number;
    fitsTier: RamTierGB | null;
    heldBack: string[];
  }>;
}

export type ProposedRoster = CuratedModel[];

/** The review model's verdict + beginner-facing copy for one candidate. */
export interface Judgement {
  ollamaName: string;
  include: boolean;
  isBeginnerChatModel: boolean;
  displayName: string;
  provider: string;
  description: string;
  bestFor: string[];
  quality: "excellent" | "great" | "good";
  speed: "fast" | "medium" | "slow";
  confidence: "high" | "low";
  reason: string;
}
