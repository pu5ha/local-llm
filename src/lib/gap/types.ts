export type Openness = "open" | "closed";

/**
 * Fields we read from GET https://artificialanalysis.ai/api/v2/language/models/free.
 * The Intelligence Index field's exact nesting on the free tier isn't fully
 * documented — fetchAaModels.ts reads it defensively from either location.
 */
export interface AaModelRecord {
  id?: string;
  slug: string;
  name: string;
  release_date?: string | null;
  model_creator: { name: string; slug: string };
  artificial_analysis_intelligence_index?: number | null;
  evaluations?: { artificial_analysis_intelligence_index?: number | null };
}

export interface ClassifiedModel {
  slug: string;
  name: string;
  creatorSlug: string;
  creatorName: string;
  intelligenceIndex: number;
  openness: Openness;
}

export interface UnclassifiedModel {
  creatorName: string;
  creatorSlug: string;
  modelName: string;
  slug: string;
}

export interface GapLeader {
  name: string;
  creatorName: string;
  slug: string;
  intelligenceIndex: number;
}

/**
 * gapPoints = closedLeader.intelligenceIndex - openLeader.intelligenceIndex.
 * NOT clamped to 0 — on a given day an open model can lead, and that's an
 * honest, interesting case rather than something to hide.
 */
export interface CurrentGap {
  gapPoints: number;
  openLeader: GapLeader;
  closedLeader: GapLeader;
}

export type GapDataSource = "live" | "fallback-snapshot";

export interface GapMeta {
  fetchedAt: string;
  source: GapDataSource;
  warning?: string;
}

/** One dated entry in Epoch AI's published "months behind" research log. */
export interface EpochFinding {
  asOf: string;
  monthsBehind: number;
  eciPoints?: number;
  confidenceNote?: string;
  sourceUrl: string;
  sourceLabel: string;
  note?: string;
}

export interface GapHistoryPoint {
  date: string;
  gapPoints: number;
  openLeader: string;
  closedLeader: string;
  sourceUrl: string;
  sourceLabel: string;
  /** true = hand-cited historical checkpoint; absent = auto-recorded by the refresh script. */
  seeded?: boolean;
}

export interface FallbackGapSnapshot {
  generatedAt: string;
  models: ClassifiedModel[];
  unclassified: UnclassifiedModel[];
}

export interface GapHistoryFile {
  points: GapHistoryPoint[];
}

/** Everything the page needs. */
export interface GapData {
  current: CurrentGap;
  meta: GapMeta;
  unclassified: UnclassifiedModel[];
  epochFindings: EpochFinding[]; // ascending by asOf
  history: GapHistoryPoint[]; // ascending by date
}
