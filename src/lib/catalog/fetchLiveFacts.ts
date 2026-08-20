import "server-only";
import { curatedModels } from "./curated";
import type { ModelFacts } from "./types";

const HF_API_BASE = "https://huggingface.co/api/models";
const REVALIDATE_SECONDS = 60 * 60 * 6; // 6h — trending models don't need faster
const FETCH_TIMEOUT_MS = 5000;
export const CATALOG_TAG = "model-facts";

// Discovery candidates that are obviously not beginner-relevant local chat
// models — filtered out before they ever reach the /admin review list.
const DISCOVERY_NOISE_PATTERN =
  /tiny-|trl-internal|-test|facebook\/opt-125m|gpt2$|distilgpt2/i;

interface HfApiModel {
  id: string;
  downloads?: number;
  likes?: number;
  lastModified?: string;
}

function toModelFacts(m: HfApiModel): ModelFacts {
  return {
    hfModelId: m.id,
    downloads: m.downloads,
    likes: m.likes,
    lastModified: m.lastModified,
  };
}

async function fetchOne(hfModelId: string): Promise<ModelFacts | null> {
  try {
    const res = await fetch(`${HF_API_BASE}/${hfModelId}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as HfApiModel;
    return toModelFacts(json);
  } catch {
    return null;
  }
}

async function fetchDiscoveryCandidates(): Promise<ModelFacts[]> {
  const res = await fetch(
    `${HF_API_BASE}?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=40`,
    {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as HfApiModel[];
  if (!Array.isArray(json)) return [];
  return json
    .filter((m) => m.id && !DISCOVERY_NOISE_PATTERN.test(m.id))
    .map(toModelFacts);
}

/**
 * Fetches live facts for every curated model (exact per-repo lookup, so
 * numbers are always for exactly the model the owner picked) plus a broad
 * "trending text-generation models" sweep used only to populate the
 * /admin/catalog uncurated-review list.
 */
export async function fetchLiveFacts(): Promise<ModelFacts[]> {
  const curatedIds = curatedModels.map((m) => m.hfModelId);

  const [curatedResults, discoveryResults] = await Promise.all([
    Promise.all(curatedIds.map(fetchOne)),
    fetchDiscoveryCandidates(),
  ]);

  const curatedFacts = curatedResults.filter((f): f is ModelFacts => f !== null);

  if (curatedFacts.length === 0) {
    throw new Error("Hugging Face API returned no usable data for any curated model");
  }

  const seen = new Set(curatedFacts.map((f) => f.hfModelId));
  const extraDiscovery = discoveryResults.filter((f) => !seen.has(f.hfModelId));

  return [...curatedFacts, ...extraDiscovery];
}
