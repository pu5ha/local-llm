import "server-only";
import { fetchAaModels } from "./fetchAaModels";
import { getFallbackGapSnapshot } from "./fallbackSnapshot";
import { getGapHistory } from "./history";
import { computeCurrentGap, buildLeaderboard } from "./computeGap";
import { epochFindings } from "./epochFindings";
import type { GapData } from "./types";

/**
 * Orchestrates: try a live fetch, fall back to the committed snapshot on any
 * failure. Never throws — the site must never show blank/broken data because
 * a third-party API had a bad day.
 */
export async function getGapData(): Promise<GapData> {
  try {
    const { classified, unclassified } = await fetchAaModels();
    const current = computeCurrentGap(classified);
    if (!current) throw new Error("No open+closed pair found in live data");
    return {
      current,
      meta: { fetchedAt: new Date().toISOString(), source: "live" },
      unclassified,
      epochFindings,
      history: getGapHistory(),
      leaderboard: buildLeaderboard(classified),
    };
  } catch (err) {
    console.warn("[gap] live fetch failed, using fallback snapshot:", err);
    const snapshot = getFallbackGapSnapshot();
    const current = computeCurrentGap(snapshot.models);
    if (!current) {
      throw new Error(
        "[gap] fallback snapshot has no classifiable open+closed pair — fix data/fallback-snapshot.json"
      );
    }
    return {
      current,
      meta: {
        fetchedAt: snapshot.generatedAt,
        source: "fallback-snapshot",
        warning: "Live benchmark data unavailable; showing last-known-good snapshot.",
      },
      unclassified: snapshot.unclassified,
      epochFindings,
      history: getGapHistory(),
      leaderboard: buildLeaderboard(snapshot.models),
    };
  }
}
