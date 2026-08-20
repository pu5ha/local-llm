import "server-only";
import { fetchHfModelsNews } from "./sources/hfModels";
import { fetchHfPapersNews } from "./sources/hfPapers";
import { fetchGithubReleasesNews } from "./sources/githubReleases";
import { fetchHackerNewsNews } from "./sources/hackerNews";
import { fetchRssNews } from "./sources/rssFeeds";
import type { NewsItem } from "./types";

/**
 * Each source fetcher already catches its own errors and resolves to [], so
 * this Promise.allSettled is defense-in-depth against a source module
 * throwing unexpectedly — with 5 independent sources (vs. the model
 * catalog's 1), one bad source must never take down the other four.
 */
export async function fetchLiveNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    fetchHfModelsNews(),
    fetchHfPapersNews(),
    fetchGithubReleasesNews(),
    fetchHackerNewsNews(),
    fetchRssNews(),
  ]);
  const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (items.length === 0) {
    throw new Error("All news sources failed or returned no items");
  }
  return items;
}
