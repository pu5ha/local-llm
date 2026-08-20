import type { NewsItem } from "../types";
import type { RewriteResponse } from "./schema";

/**
 * Maps rewritten { url, plainTitle, plainSummary, include } results back
 * onto the original items by url.
 *
 * - No matching result at all (model silently omitted the url): keep the
 *   item unchanged (raw title/summary) rather than dropping it — a model
 *   omission shouldn't silently delete content.
 * - Matching result with include === false: drop the item entirely — the
 *   model judged it not newsworthy (routine change, near-duplicate upload).
 * - Matching result otherwise: keep it with plainTitle/plainSummary applied.
 */
export function applyRewriteResults(
  items: NewsItem[],
  response: RewriteResponse | null
): NewsItem[] {
  if (!response) return items;

  const byUrl = new Map(response.items.map((r) => [r.url, r]));

  return items.flatMap((item) => {
    const rewritten = byUrl.get(item.url);
    if (!rewritten) return [item];
    if (rewritten.include === false) return [];
    return [{ ...item, plainTitle: rewritten.plainTitle, plainSummary: rewritten.plainSummary }];
  });
}
