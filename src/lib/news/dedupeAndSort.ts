import type { NewsItem } from "./types";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
];

export function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    TRACKING_PARAMS.forEach((p) => u.searchParams.delete(p));
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.hostname.replace(/^www\./, "")}${path}${u.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Dedupes by canonical URL (first occurrence wins) and sorts newest-first. */
export function dedupeAndSort(items: NewsItem[]): NewsItem[] {
  const byUrl = new Map<string, NewsItem>();
  for (const item of items) {
    const key = canonicalizeUrl(item.url);
    if (!byUrl.has(key)) byUrl.set(key, item);
  }
  return [...byUrl.values()].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
}

/**
 * Age-cutoff + count cap. Deliberately separate from dedupeAndSort: the
 * fallback (committed-snapshot) path skips the age cutoff entirely, since a
 * stale snapshot shouldn't be zeroed out by its own staleness if the site
 * hasn't been redeployed in a while.
 */
export function capAndFilterRecent(
  items: NewsItem[],
  now: Date,
  maxAgeDays: number,
  maxItems: number
): NewsItem[] {
  const cutoff = now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000;
  return items
    .filter((i) => Date.parse(i.publishedAt) >= cutoff)
    .slice(0, maxItems);
}
