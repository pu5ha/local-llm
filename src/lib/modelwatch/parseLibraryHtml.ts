import type { LibraryEntry } from "./types";

const MULTIPLIER: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9 };

/** "1.2M" -> 1200000, "980K" -> 980000, "512" -> 512. */
export function parsePullCount(raw: string): number | null {
  const m = /^([\d.]+)\s*([KMB])?$/i.exec(raw.trim());
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * (m[2] ? MULTIPLIER[m[2].toUpperCase()] : 1));
}

/**
 * Parses https://ollama.com/library into one entry per model family.
 *
 * The page is server-rendered with no JSON payload, so this reads the markup
 * directly. It deliberately does the crudest thing that works — split on the
 * anchor that starts each card, strip tags, and read the text — because that
 * degrades to an empty array when the markup changes rather than producing
 * plausible-looking nonsense. Callers must treat a short result as a broken
 * parser (see MIN_LIBRARY_ENTRIES), not as a small catalogue.
 */
export function parseLibraryHtml(html: string): LibraryEntry[] {
  const entries: LibraryEntry[] = [];
  const seen = new Set<string>();

  for (const block of html.split(/(?=<a\s[^>]*href="\/library\/)/)) {
    const href = /href="\/library\/([a-z0-9._-]+)"/.exec(block);
    if (!href) continue;
    const family = href[1];
    if (seen.has(family)) continue;

    const text = decodeEntities(block.replace(/<[^>]+>/g, " "));

    const pullsMatch = /([\d.]+\s*[KMB]?)\s*Pulls/i.exec(text);
    const pulls = pullsMatch ? parsePullCount(pullsMatch[1]) : null;

    // Badges like "12b"/"26b"; excludes the pull count because that always
    // carries a K/M/B suffix and a "Pulls" label.
    const sizeBadges = [
      ...new Set(
        [...text.matchAll(/\b(\d+(?:\.\d+)?[bB])\b/g)].map((m) => m[1].toLowerCase())
      ),
    ];

    const updated = /Updated\s+([^\n]{1,24})/.exec(text);

    seen.add(family);
    entries.push({
      family,
      pulls: pulls ?? 0,
      sizeBadges,
      updatedText: updated ? updated[1].trim() : "",
    });
  }

  return entries;
}

/** Tag names from https://ollama.com/library/<family>/tags. */
export function parseTagsHtml(family: string, html: string): string[] {
  const prefix = new RegExp(`href="/library/${escapeRe(family)}:([a-z0-9._-]+)"`, "g");
  return [...new Set([...html.matchAll(prefix)].map((m) => m[1]))];
}

/**
 * "35b-a3b" -> { parametersB: 35, activeParametersB: 3 } — the Ollama
 * convention where aNb means N billion active parameters in a
 * Mixture-of-Experts model. Active params are what makes a 35B MoE feel
 * faster than a dense 27B, so they must not be lost.
 */
export function parseSizeTag(
  tag: string
): { parametersB: number; activeParametersB?: number } | null {
  const total = /^(\d+(?:\.\d+)?)b\b/i.exec(tag);
  if (!total) return null;
  const parametersB = Number.parseFloat(total[1]);
  if (!Number.isFinite(parametersB) || parametersB <= 0) return null;

  const active = /-a(\d+(?:\.\d+)?)b\b/i.exec(tag);
  const activeParametersB = active ? Number.parseFloat(active[1]) : undefined;

  return activeParametersB !== undefined && activeParametersB < parametersB
    ? { parametersB, activeParametersB }
    : { parametersB };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Turns Ollama's relative "Updated" text into an approximate age in days.
 *
 * Coarse on purpose — it only has to distinguish "this generation" from "last
 * generation", which is the difference between recommending gemma4 and
 * recommending an 11-month-old qwen3. Returns null when the text is
 * unparseable, and callers treat null as "unknown age", not "fresh".
 */
export function parseRelativeAgeDays(updatedText: string): number | null {
  const m = /(\d+)\s*(hour|day|week|month|year)/i.exec(updatedText);
  if (!m) {
    // "yesterday" / "today" style text, plus Ollama's "Updated to version x"
    return /yesterday|today|just now/i.test(updatedText) ? 1 : null;
  }
  const n = Number.parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const perUnit: Record<string, number> = {
    hour: 1 / 24,
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };
  return Math.round(n * perUnit[unit]);
}
