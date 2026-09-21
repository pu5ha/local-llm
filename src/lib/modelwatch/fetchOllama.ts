import {
  FETCH_CONCURRENCY,
  FETCH_TIMEOUT_MS,
  HF_API_BASE,
  LIBRARY_URLS,
  MANIFEST_ACCEPT,
  MANIFEST_URL,
  TAGS_URL,
} from "./constants";
import { parseLibraryHtml, parseTagsHtml } from "./parseLibraryHtml";
import { parseManifest } from "./parseManifest";
import type { LibraryEntry, ManifestFacts } from "./types";

/**
 * Network adapters for the model-watch pipeline.
 *
 * Deliberately not `server-only`: scripts/refresh-modelwatch.ts runs outside a
 * Next request context, and the `server-only` guards on src/lib/news/sources/*
 * are exactly why refresh-news-snapshot.ts had to duplicate its fetch logic.
 * Keeping these importable avoids repeating that mistake.
 *
 * Every function resolves rather than rejects; callers detect trouble from
 * empty results plus the ratio guards in runWatch.
 */

async function getText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "user-agent": "localllm-modelwatch/1.0 (+https://github.com/pu5ha/local-llm)" },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Runs tasks with a concurrency cap, so we never stampede an upstream host. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** The union of the popular and newest listings, deduped by family. */
export async function fetchLibrary(): Promise<LibraryEntry[]> {
  const pages = await Promise.all(LIBRARY_URLS.map(getText));
  const byFamily = new Map<string, LibraryEntry>();

  for (const html of pages) {
    if (!html) continue;
    for (const entry of parseLibraryHtml(html)) {
      // Keep whichever listing reported more pulls; the two sorts can lag.
      const existing = byFamily.get(entry.family);
      if (!existing || entry.pulls > existing.pulls) byFamily.set(entry.family, entry);
    }
  }

  return [...byFamily.values()].sort((a, b) => b.pulls - a.pulls);
}

export async function fetchTags(family: string): Promise<string[]> {
  const html = await getText(TAGS_URL(family));
  return html ? parseTagsHtml(family, html) : [];
}

/**
 * Measures one tag, and doubles as the local-runnable test: Ollama Cloud
 * models answer MANIFEST_UNKNOWN here, which is the only reliable way to tell
 * them apart from local downloads.
 */
export async function fetchManifest(ollamaName: string): Promise<ManifestFacts | null> {
  const [family, tag] = ollamaName.split(":");
  if (!family || !tag) return null;
  try {
    const res = await fetch(MANIFEST_URL(family, tag), {
      headers: { accept: MANIFEST_ACCEPT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return parseManifest(ollamaName, await res.json());
  } catch {
    return null;
  }
}

export interface HfFacts {
  hfModelId: string;
  downloads?: number;
  likes?: number;
  lastModified?: string;
  license?: string;
}

/**
 * Validates a guessed HF repo id.
 *
 * A gated or renamed repo answers HTTP 200 with
 * {"error":"Invalid username or password."} rather than 404, so checking
 * res.ok alone would accept a factless object and silently poison the join
 * key. The `id` check is what makes validation meaningful.
 */
export async function fetchHfFacts(hfModelId: string): Promise<HfFacts | null> {
  try {
    const res = await fetch(`${HF_API_BASE}/${hfModelId}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      id?: unknown;
      downloads?: number;
      likes?: number;
      lastModified?: string;
      cardData?: { license?: string };
      tags?: string[];
    };
    if (typeof json.id !== "string") return null;
    const licenseTag = json.tags?.find((t) => t.startsWith("license:"));
    return {
      hfModelId: json.id,
      downloads: json.downloads,
      likes: json.likes,
      lastModified: json.lastModified,
      license: json.cardData?.license ?? licenseTag?.replace("license:", ""),
    };
  } catch {
    return null;
  }
}

/** First guess that resolves, or null. Stops on the first hit to save calls. */
export async function resolveHf(guesses: string[]): Promise<HfFacts | null> {
  for (const guess of guesses) {
    const facts = await fetchHfFacts(guess);
    if (facts) return facts;
  }
  return null;
}

export const CONCURRENCY = FETCH_CONCURRENCY;
