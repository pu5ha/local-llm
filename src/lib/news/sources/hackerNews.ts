import "server-only";
import { categorizeByKeyword } from "../categorize";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

const HN_QUERIES = [
  "local llm",
  "llama.cpp",
  "ollama",
  "GGUF",
  "on-device AI",
  "NPU",
  "Apple Silicon inference",
  "consumer GPU AI",
];
const HN_MIN_POINTS = 20;

interface HnHit {
  title?: string;
  url?: string;
  objectID?: string;
  created_at?: string;
  points?: number;
}

async function fetchOneQuery(query: string): Promise<NewsItem[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${encodeURIComponent(
      query
    )}&numericFilters=points%3E%3D${HN_MIN_POINTS}`;
    const res = await fetch(url, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { hits?: HnHit[] };
    const hits = Array.isArray(json.hits) ? json.hits : [];
    return hits
      .filter((h) => h.title && h.created_at)
      .map((h) => ({
        title: h.title as string,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        source: "Hacker News",
        sourceKind: "hacker-news" as const,
        category: categorizeByKeyword(h.title as string),
        publishedAt: h.created_at as string,
        points: h.points,
      }));
  } catch {
    return [];
  }
}

export async function fetchHackerNewsNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(HN_QUERIES.map(fetchOneQuery));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
