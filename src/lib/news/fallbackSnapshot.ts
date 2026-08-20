import "server-only";
import snapshot from "./data/news-fallback-snapshot.json";
import type { FallbackNewsSnapshot, NewsItem } from "./types";

const typedSnapshot = snapshot as FallbackNewsSnapshot;

export function getFallbackNewsItems(): NewsItem[] {
  return typedSnapshot.items;
}
