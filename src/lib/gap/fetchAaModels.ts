import "server-only";
import { classifyModel } from "./classification";
import type { AaModelRecord, ClassifiedModel, UnclassifiedModel } from "./types";

export const GAP_TAG = "gap-data";

const AA_API_URL = "https://artificialanalysis.ai/api/v2/language/models/free";
const REVALIDATE_SECONDS = 60 * 60 * 12; // free tier is 100 req/24h — one call covers the whole tab
const FETCH_TIMEOUT_MS = 8000;

function intelligenceIndexOf(r: AaModelRecord): number | null {
  const v =
    r.artificial_analysis_intelligence_index ??
    r.evaluations?.artificial_analysis_intelligence_index;
  return typeof v === "number" ? v : null;
}

/** Shared with scripts/refresh-gap-snapshot.ts so both stay in sync. */
export function classifyAndReduce(records: AaModelRecord[]): {
  classified: ClassifiedModel[];
  unclassified: UnclassifiedModel[];
} {
  const classified: ClassifiedModel[] = [];
  const unclassified: UnclassifiedModel[] = [];

  for (const r of records) {
    const intelligenceIndex = intelligenceIndexOf(r);
    if (intelligenceIndex === null) continue;

    const openness = classifyModel(r.model_creator.slug, r.model_creator.name, r.name);
    if (!openness) {
      unclassified.push({
        creatorName: r.model_creator.name,
        creatorSlug: r.model_creator.slug,
        modelName: r.name,
        slug: r.slug,
      });
      continue;
    }

    classified.push({
      slug: r.slug,
      name: r.name,
      creatorSlug: r.model_creator.slug,
      creatorName: r.model_creator.name,
      intelligenceIndex,
      openness,
    });
  }

  return { classified, unclassified };
}

async function fetchRaw(): Promise<AaModelRecord[]> {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  if (!apiKey) throw new Error("ARTIFICIAL_ANALYSIS_API_KEY not set");

  const res = await fetch(AA_API_URL, {
    headers: { "x-api-key": apiKey },
    next: { revalidate: REVALIDATE_SECONDS, tags: [GAP_TAG] },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Artificial Analysis API returned ${res.status}`);

  const json = await res.json();
  const data = Array.isArray(json) ? json : json?.data;
  if (!Array.isArray(data)) throw new Error("Unexpected Artificial Analysis response shape");
  return data as AaModelRecord[];
}

export async function fetchAaModels() {
  const records = await fetchRaw();
  const result = classifyAndReduce(records);
  if (result.classified.length === 0) {
    throw new Error("Artificial Analysis API returned no classifiable models");
  }
  return result;
}
