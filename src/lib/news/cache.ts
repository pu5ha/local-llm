import "server-only";
import { Redis } from "@upstash/redis";
import { NEWS_REVALIDATE_SECONDS } from "./constants";
import type { NewsFeed } from "./types";

const CACHE_KEY = "news:feed-cache";

let client: Redis | null | undefined;

/**
 * Lazily constructed, and entirely optional — if Redis isn't configured
 * (e.g. a fresh local checkout with no Upstash credentials), caching is
 * simply skipped and getNews() falls back to computing the feed live every
 * time, exactly like before this cache existed.
 */
function getRedis(): Redis | null {
  if (client === undefined) {
    client =
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? Redis.fromEnv()
        : null;
  }
  return client;
}

/**
 * Without this, every single request recomputes the whole live pipeline
 * (dozens of source fetches + parallel LLM rewrite calls) from scratch —
 * masked in production by page-level ISR (the page only regenerates once
 * per revalidate window), but `next dev` has no such caching, so every
 * visit pays the full ~7s cost. This decouples "don't redo expensive work
 * too often" from any particular rendering mode.
 */
export async function getCachedFeed(): Promise<NewsFeed | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<NewsFeed>(CACHE_KEY);
  } catch (err) {
    console.warn("[news] cache read failed, computing live:", err);
    return null;
  }
}

/** Best-effort — a failed cache write should never fail the actual request. */
export async function setCachedFeed(feed: NewsFeed): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(CACHE_KEY, feed, { ex: NEWS_REVALIDATE_SECONDS });
  } catch (err) {
    console.warn("[news] cache write failed:", err);
  }
}

/** Used by the admin "refresh now" escape hatch so it actually forces a live refetch. */
export async function clearCachedFeed(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(CACHE_KEY);
  } catch (err) {
    console.warn("[news] cache clear failed:", err);
  }
}
