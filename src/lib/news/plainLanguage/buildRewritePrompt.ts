import type { NewsItem } from "../types";

export interface RewriteBatchInput {
  url: string;
  title: string;
  source: string;
  category: string;
  summary?: string;
}

/** Turns a batch of items into the JSON payload sent to the rewrite model. */
export function buildRewritePrompt(items: NewsItem[]): RewriteBatchInput[] {
  return items.map((item) => ({
    url: item.url,
    title: item.title,
    source: item.source,
    category: item.category,
    summary: item.summary,
  }));
}
