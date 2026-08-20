import type { NewsItem } from "../types";
import type { RewriteResponse } from "./schema";

/**
 * Maps rewritten { url, plainTitle, plainSummary } results back onto the
 * original items by url. Anything not returned (missing/malformed) is left
 * unchanged — plainTitle/plainSummary stay undefined, so the UI falls back
 * to the raw title/summary rather than showing nothing.
 */
export function applyRewriteResults(
  items: NewsItem[],
  response: RewriteResponse | null
): NewsItem[] {
  if (!response) return items;

  const byUrl = new Map(response.items.map((r) => [r.url, r]));

  return items.map((item) => {
    const rewritten = byUrl.get(item.url);
    if (!rewritten) return item;
    return {
      ...item,
      plainTitle: rewritten.plainTitle,
      plainSummary: rewritten.plainSummary,
    };
  });
}
