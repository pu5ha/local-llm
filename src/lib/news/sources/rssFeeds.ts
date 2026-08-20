import "server-only";
import Parser from "rss-parser";
import { categorizeByKeyword } from "../categorize";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

const parser = new Parser();

const CURATED_FEEDS = [
  { url: "https://simonwillison.net/atom/everything/", displayName: "Simon Willison" },
  { url: "https://huggingface.co/blog/feed.xml", displayName: "Hugging Face Blog" },
  { url: "https://arstechnica.com/ai/feed/", displayName: "Ars Technica" },
] as const;

async function fetchOneFeed(entry: (typeof CURATED_FEEDS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(entry.url, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    // Fetched manually (rather than parser.parseURL) so this goes through
    // Next's fetch cache/revalidate/timeout like every other source.
    const feed = await parser.parseString(await res.text());
    return (feed.items ?? [])
      .filter((i) => i.title && i.link)
      .map((i) => {
        const text = `${i.title} ${i.contentSnippet ?? ""}`;
        return {
          title: i.title as string,
          url: i.link as string,
          summary: i.contentSnippet?.slice(0, 280),
          source: entry.displayName,
          sourceKind: "rss" as const,
          category: categorizeByKeyword(text),
          publishedAt: i.isoDate ?? i.pubDate ?? new Date().toISOString(),
        };
      });
  } catch {
    return [];
  }
}

export async function fetchRssNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(CURATED_FEEDS.map(fetchOneFeed));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
