import "server-only";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

// The trending endpoint (community likes/downloads velocity) surfaces models
// people are actually talking about right now — sorting the plain models
// list by createdAt instead just returns a firehose of spam fine-tunes.
const HF_TRENDING_API = "https://huggingface.co/api/trending?type=model&limit=20";

interface HfTrendingEntry {
  repoData?: {
    id?: string;
    lastModified?: string;
    likes?: number;
    downloads?: number;
  };
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
    return entries
      .filter((e) => e.repoData?.id && e.repoData?.lastModified)
      .map((e) => {
        const r = e.repoData!;
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
          publishedAt: r.lastModified as string,
        };
      });
  } catch {
    return [];
  }
}
