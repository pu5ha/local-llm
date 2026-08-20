import "server-only";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

const HF_DAILY_PAPERS_API = "https://huggingface.co/api/daily_papers?limit=20";

interface HfPaperEntry {
  paper?: {
    id?: string;
    title?: string;
    summary?: string;
    publishedAt?: string;
  };
}

export async function fetchHfPapersNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(HF_DAILY_PAPERS_API, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as HfPaperEntry[];
    if (!Array.isArray(json)) return [];
    return json
      .filter((e) => e.paper?.id && e.paper?.title && e.paper?.publishedAt)
      .map((e) => {
        const p = e.paper!;
        return {
          title: p.title as string,
          url: `https://huggingface.co/papers/${p.id}`,
          summary: p.summary?.slice(0, 280),
          source: "Hugging Face Papers",
          sourceKind: "hf-papers" as const,
          category: "research" as const,
          publishedAt: p.publishedAt as string,
        };
      });
  } catch {
    return [];
  }
}
