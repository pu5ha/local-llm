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
 *
 * hf-models items are exempt from the age cutoff: their publishedAt is the
 * model's true creation date (for an honest displayed timestamp), but a
 * model surfacing on Hugging Face's trending list is itself the recency
 * signal — a model can keep trending for months after release, and
 * age-filtering it back out by creation date would silently drop items the
 * source fetch specifically selected as currently relevant.
 */
export function capAndFilterRecent(
  items: NewsItem[],
  now: Date,
  maxAgeDays: number,
  maxItems: number
): NewsItem[] {
  const cutoff = now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000;
  return items
    .filter((i) => i.sourceKind === "hf-models" || Date.parse(i.publishedAt) >= cutoff)
    .slice(0, maxItems);
}
