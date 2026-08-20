import "server-only";
import { fetchLiveNews } from "./fetchLiveNews";
import { getFallbackNewsItems } from "./fallbackSnapshot";
import { dedupeAndSort, capAndFilterRecent } from "./dedupeAndSort";
import type { NewsFeed } from "./types";

const MAX_AGE_DAYS = 30;
const MAX_ITEMS = 100;

/**
 * Orchestrates: try a live fetch, fall back to the committed snapshot on any
 * failure. Never throws — the site must never show blank/broken data because
 * a third-party API had a bad day.
 */
export async function getNews(): Promise<NewsFeed> {
  try {
    const items = await fetchLiveNews();
    return {
      items: capAndFilterRecent(dedupeAndSort(items), new Date(), MAX_AGE_DAYS, MAX_ITEMS),
      meta: { fetchedAt: new Date().toISOString(), source: "live" },
    };
  } catch (err) {
    console.warn("[news] live fetch failed, using fallback snapshot:", err);
    return {
      // Skip the 30-day age cutoff here: a stale committed snapshot
      // shouldn't be zeroed out by its own staleness.
      items: dedupeAndSort(getFallbackNewsItems()).slice(0, MAX_ITEMS),
      meta: {
        fetchedAt: new Date().toISOString(),
        source: "fallback-snapshot",
        warning: "Live news data unavailable; showing last-known-good snapshot.",
      },
    };
  }
}
