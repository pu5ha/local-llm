import { TAG_DENY } from "./constants";
import { parseSizeTag } from "./parseLibraryHtml";

/**
 * Picks the one tag per size a beginner should actually type.
 *
 * Ollama exposes dozens of tags per family — MLX builds, bf16, q8_0, QAT,
 * cloud. We want the plain default, because it is the shortest to type and
 * what every tutorial uses. Anything else is either not a local download or
 * not the default quantization our sizing assumes.
 *
 * Returns tags keyed by their parameter size so callers can consider one
 * candidate per size rather than per tag.
 */
export function chooseTags(family: string, tags: string[]): string[] {
  const bySize = new Map<string, string[]>();

  for (const tag of tags) {
    if (TAG_DENY.test(tag)) continue;
    const parsed = parseSizeTag(tag);
    if (!parsed) continue; // "latest", "e4b" and friends — no explicit size
    const key = `${parsed.parametersB}-${parsed.activeParametersB ?? ""}`;
    const list = bySize.get(key) ?? [];
    list.push(tag);
    bySize.set(key, list);
  }

  const chosen: string[] = [];
  for (const candidates of bySize.values()) {
    candidates.sort(preferPlainest);
    chosen.push(`${family}:${candidates[0]}`);
  }
  return chosen.sort();
}

/**
 * Shortest wins, ties broken alphabetically. "27b" beats "27b-it-qat";
 * "35b-a3b" is the only form of its size so it wins by default. Sorting
 * deterministically matters — an unstable choice would churn the diff.
 */
function preferPlainest(a: string, b: string): number {
  if (a.length !== b.length) return a.length - b.length;
  return a < b ? -1 : a > b ? 1 : 0;
}
