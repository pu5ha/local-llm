import { FAMILY_DENYLIST, MAX_AGE_DAYS, MIN_PULLS } from "./constants";
import { parseRelativeAgeDays } from "./parseLibraryHtml";
import type { LibraryEntry } from "./types";

/**
 * Reasons a family can't be a beginner recommendation, checked BEFORE any
 * per-model network call. Returns every reason rather than the first, so the
 * report can explain itself.
 *
 * Note there is no cloud-only check here: that is decided by whether the
 * registry manifest resolves (see parseManifest). Ollama's /api/tags cloud
 * list looks like the right filter but its entries collide with real local
 * tags — it lists gemma4:31b, which is also a genuine 19.9GB local download —
 * so filtering on it drops the best families entirely.
 */
export function excludeReasons(entry: LibraryEntry): string[] {
  const reasons: string[] = [];

  if (FAMILY_DENYLIST.test(entry.family)) {
    reasons.push("not a general-purpose chat model");
  }
  if (entry.pulls < MIN_PULLS) {
    reasons.push(`only ${entry.pulls.toLocaleString()} pulls, no track record yet`);
  }
  if (entry.sizeBadges.length === 0) {
    reasons.push("no parameter size published");
  }
  // Age is the signal that keeps a previous generation from displacing a
  // current one. Without it, "biggest model that fits" happily recommends an
  // 11-month-old qwen3:14b over gemma4:12b purely because it's 1.7GB larger.
  const ageDays = parseRelativeAgeDays(entry.updatedText);
  if (ageDays !== null && ageDays > MAX_AGE_DAYS) {
    reasons.push(`last updated ${entry.updatedText} — previous generation`);
  }

  return reasons;
}

export function isEligible(entry: LibraryEntry): boolean {
  return excludeReasons(entry).length === 0;
}
