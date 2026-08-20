import "server-only";
import { curatedModels } from "./curated";
import { fetchLiveFacts } from "./fetchLiveFacts";
import { getFallbackFacts, getFallbackUncurated } from "./fallbackSnapshot";
import { mergeCatalog } from "./mergeCatalog";
import type { Catalog } from "./types";

/**
 * Orchestrates: try a live fetch, fall back to the committed snapshot on any
 * failure. Never throws — the site must never show blank/broken data because
 * a third-party API had a bad day.
 */
export async function getCatalog(): Promise<Catalog> {
  try {
    const facts = await fetchLiveFacts();
    return mergeCatalog(curatedModels, facts, "live");
  } catch (err) {
    console.warn("[catalog] live fetch failed, using fallback snapshot:", err);
    const facts = getFallbackFacts();
    const catalog = mergeCatalog(
      curatedModels,
      facts,
      "fallback-snapshot",
      getFallbackUncurated()
    );
    catalog.meta.warning =
      "Live model data unavailable; showing last-known-good snapshot.";
    return catalog;
  }
}
