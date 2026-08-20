import "server-only";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

// The trending endpoint (community likes/downloads velocity) surfaces models
// people are actually talking about right now — sorting the plain models
// list by createdAt instead just returns a firehose of spam fine-tunes.
const HF_TRENDING_API = "https://huggingface.co/api/trending?type=model&limit=20";
const HF_MODEL_DETAIL_API = "https://huggingface.co/api/models";

interface HfTrendingEntry {
  repoData?: {
    id?: string;
    lastModified?: string;
    likes?: number;
    downloads?: number;
  };
}

/**
 * The trending endpoint only exposes lastModified (last file/metadata edit),
 * not the model's actual release date — a model can look "10h ago" forever
 * if someone tweaks its README, even if it shipped months earlier. Fetch the
 * real createdAt per model; fall back to lastModified for any one model
 * whose detail lookup fails, rather than dropping it.
 */
async function fetchCreatedAt(hfModelId: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(`${HF_MODEL_DETAIL_API}/${hfModelId}`, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { createdAt?: string };
    return json.createdAt ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchHfModelsNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(HF_TRENDING_API, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { recentlyTrending?: HfTrendingEntry[] };
    const entries = Array.isArray(json.recentlyTrending) ? json.recentlyTrending : [];
    const candidates = entries.filter((e) => e.repoData?.id && e.repoData?.lastModified);

    return await Promise.all(
      candidates.map(async (e) => {
        const r = e.repoData!;
        const publishedAt = await fetchCreatedAt(r.id as string, r.lastModified as string);
        return {
          title: r.id as string,
          url: `https://huggingface.co/${r.id}`,
          summary:
            r.downloads !== undefined
              ? `${r.downloads.toLocaleString()} downloads, ${r.likes?.toLocaleString() ?? 0} likes`
              : undefined,
          source: "Hugging Face",
          sourceKind: "hf-models" as const,
          category: "models" as const,
          publishedAt,
        };
      })
    );
  } catch {
    return [];
  }
}
