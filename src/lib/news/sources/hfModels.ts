import "server-only";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

const HF_MODELS_API =
  "https://huggingface.co/api/models?pipeline_tag=text-generation&sort=createdAt&direction=-1&limit=20";

interface HfApiModel {
  id: string;
  createdAt?: string;
}

export async function fetchHfModelsNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(HF_MODELS_API, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as HfApiModel[];
    if (!Array.isArray(json)) return [];
    return json
      .filter((m) => m.id && m.createdAt)
      .map((m) => ({
        title: m.id,
        url: `https://huggingface.co/${m.id}`,
        source: "Hugging Face",
        sourceKind: "hf-models" as const,
        category: "models" as const,
        publishedAt: m.createdAt as string,
      }));
  } catch {
    return [];
  }
}
