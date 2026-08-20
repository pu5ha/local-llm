/**
 * Regenerates src/lib/news/data/news-fallback-snapshot.json. Run with
 * `npm run news:snapshot` and commit the diff.
 *
 * Duplicates the FETCH logic from src/lib/news/sources/*.ts as plain code
 * (rather than importing those modules) because they start with
 * `import "server-only"`, which throws outside a Next.js server/RSC
 * context. The PURE helpers (categorize, dedupe/sort/cap, types) have no
 * such guard and are imported directly so that logic never drifts between
 * the live path and this script.
 */
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { categorizeByKeyword } from "../src/lib/news/categorize";
import { dedupeAndSort, capAndFilterRecent } from "../src/lib/news/dedupeAndSort";
import { cleanRawSummary } from "../src/lib/news/plainLanguage/cleanRawSummary";
import { buildRewritePrompt } from "../src/lib/news/plainLanguage/buildRewritePrompt";
import { applyRewriteResults } from "../src/lib/news/plainLanguage/applyRewriteResults";
import { RewriteResponseSchema, type RewriteResponse } from "../src/lib/news/plainLanguage/schema";
import {
  REWRITE_MODEL,
  REWRITE_BATCH_SIZE,
  REWRITE_TIMEOUT_MS,
  REWRITE_SYSTEM_PROMPT,
  chunk,
} from "../src/lib/news/plainLanguage/constants";
import type { NewsItem, FallbackNewsSnapshot } from "../src/lib/news/types";

const SNAPSHOT_PATH = path.join(
  __dirname,
  "../src/lib/news/data/news-fallback-snapshot.json"
);

const HF_TRENDING_API = "https://huggingface.co/api/trending?type=model&limit=20";
const HF_DAILY_PAPERS_API = "https://huggingface.co/api/daily_papers?limit=20";

const CURATED_REPOS = [
  { owner: "ollama", repo: "ollama", displayName: "Ollama" },
  { owner: "ggml-org", repo: "llama.cpp", displayName: "llama.cpp" },
  { owner: "vllm-project", repo: "vllm", displayName: "vLLM" },
  { owner: "oobabooga", repo: "text-generation-webui", displayName: "text-generation-webui" },
  { owner: "LostRuins", repo: "koboldcpp", displayName: "KoboldCpp" },
] as const;

const HN_QUERIES = [
  "local llm",
  "llama.cpp",
  "ollama",
  "GGUF",
  "on-device AI",
  "NPU",
  "Apple Silicon inference",
  "consumer GPU AI",
];
const HN_MIN_POINTS = 20;

const CURATED_FEEDS = [
  { url: "https://simonwillison.net/atom/everything/", displayName: "Simon Willison" },
  { url: "https://huggingface.co/blog/feed.xml", displayName: "Hugging Face Blog" },
  { url: "https://arstechnica.com/ai/feed/", displayName: "Ars Technica" },
] as const;

const parser = new Parser();

async function fetchHfModelsNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(HF_TRENDING_API);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      recentlyTrending?: Array<{
        repoData?: { id?: string; lastModified?: string; likes?: number; downloads?: number };
      }>;
    };
    const entries = Array.isArray(json.recentlyTrending) ? json.recentlyTrending : [];
    return entries
      .filter((e) => e.repoData?.id && e.repoData?.lastModified)
      .map((e) => {
        const r = e.repoData!;
        return {
          title: r.id as string,
          url: `https://huggingface.co/${r.id}`,
          summary:
            r.downloads !== undefined
              ? `${r.downloads.toLocaleString()} downloads, ${r.likes?.toLocaleString() ?? 0} likes`
              : undefined,
          source: "Hugging Face",
          sourceKind: "hf-models" as const,
          category: "models" as const,
          publishedAt: r.lastModified as string,
        };
      });
  } catch {
    return [];
  }
}

async function fetchHfPapersNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(HF_DAILY_PAPERS_API);
    if (!res.ok) return [];
    const json = (await res.json()) as Array<{
      paper?: { id?: string; title?: string; summary?: string; publishedAt?: string };
    }>;
    if (!Array.isArray(json)) return [];
    return json
      .filter((e) => e.paper?.id && e.paper?.title && e.paper?.publishedAt)
      .map((e) => {
        const p = e.paper!;
        return {
          title: p.title as string,
          url: `https://huggingface.co/papers/${p.id}`,
          summary: p.summary?.slice(0, 280),
          source: "Hugging Face Papers",
          sourceKind: "hf-papers" as const,
          category: "research" as const,
          publishedAt: p.publishedAt as string,
        };
      });
  } catch {
    return [];
  }
}

async function fetchOneRepo(entry: (typeof CURATED_REPOS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${entry.owner}/${entry.repo}/releases?per_page=5`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as Array<{
      tag_name?: string;
      name?: string;
      html_url?: string;
      body?: string;
      draft?: boolean;
      published_at?: string;
      created_at?: string;
    }>;
    if (!Array.isArray(json)) return [];
    return json
      .filter((r) => !r.draft && r.html_url && (r.published_at ?? r.created_at))
      .slice(0, 5)
      .map((r) => ({
        title: `${entry.displayName} ${r.tag_name ?? r.name ?? ""}`.trim(),
        url: r.html_url as string,
        summary: r.body ? r.body.slice(0, 280) : undefined,
        source: `GitHub — ${entry.displayName}`,
        sourceKind: "github-releases" as const,
        category: "tools" as const,
        publishedAt: (r.published_at ?? r.created_at) as string,
      }));
  } catch {
    return [];
  }
}

async function fetchGithubReleasesNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(CURATED_REPOS.map(fetchOneRepo));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

async function fetchOneQuery(query: string): Promise<NewsItem[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${encodeURIComponent(
      query
    )}&numericFilters=points%3E%3D${HN_MIN_POINTS}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      hits?: Array<{ title?: string; url?: string; objectID?: string; created_at?: string; points?: number }>;
    };
    const hits = Array.isArray(json.hits) ? json.hits : [];
    // See src/lib/news/sources/hackerNews.ts for why non-matching hits are
    // dropped instead of kept as "general".
    return hits
      .filter((h) => h.title && h.created_at)
      .map((h) => ({
        title: h.title as string,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        source: "Hacker News",
        sourceKind: "hacker-news" as const,
        category: categorizeByKeyword(h.title as string),
        publishedAt: h.created_at as string,
        points: h.points,
      }))
      .filter((item) => item.category !== "general");
  } catch {
    return [];
  }
}

async function fetchHackerNewsNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(HN_QUERIES.map(fetchOneQuery));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

async function fetchOneFeed(entry: (typeof CURATED_FEEDS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(entry.url);
    if (!res.ok) return [];
    const feed = await parser.parseString(await res.text());
    return (feed.items ?? [])
      .filter((i) => i.title && i.link)
      .map((i) => {
        const text = `${i.title} ${i.contentSnippet ?? ""}`;
        return {
          title: i.title as string,
          url: i.link as string,
          summary: i.contentSnippet?.slice(0, 280),
          source: entry.displayName,
          sourceKind: "rss" as const,
          category: categorizeByKeyword(text),
          publishedAt: i.isoDate ?? i.pubDate ?? new Date().toISOString(),
        };
      });
  } catch {
    return [];
  }
}

async function fetchRssNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(CURATED_FEEDS.map(fetchOneFeed));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

// Duplicates rewriteNewsItems.ts's Anthropic call as plain code (that module
// is `server-only`-guarded and can't be imported from a standalone ts-node
// script) but reuses the shared prompt/model/batch-size constants and the
// pure buildRewritePrompt/applyRewriteResults helpers so nothing drifts from
// the live path.
async function rewriteBatch(client: Anthropic, batch: NewsItem[]): Promise<NewsItem[]> {
  try {
    const payload = buildRewritePrompt(batch);
    const message = await client.messages.parse(
      {
        model: REWRITE_MODEL,
        max_tokens: 4096,
        system: [
          {
            type: "text",
            text: REWRITE_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: JSON.stringify(payload) }],
        output_config: { format: zodOutputFormat(RewriteResponseSchema) },
      },
      { timeout: REWRITE_TIMEOUT_MS }
    );
    return applyRewriteResults(batch, message.parsed_output as RewriteResponse | null);
  } catch (err) {
    console.warn("Plain-language rewrite batch failed, keeping raw text:", err);
    return batch;
  }
}

async function rewriteNewsItems(items: NewsItem[]): Promise<NewsItem[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — skipping plain-language rewrite.");
    return items;
  }
  const client = new Anthropic();
  const batches = chunk(items, REWRITE_BATCH_SIZE);
  const results = await Promise.all(batches.map((batch) => rewriteBatch(client, batch)));
  return results.flat();
}

async function main() {
  const results = await Promise.allSettled([
    fetchHfModelsNews(),
    fetchHfPapersNews(),
    fetchGithubReleasesNews(),
    fetchHackerNewsNews(),
    fetchRssNews(),
  ]);
  const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const cleaned = items.map((item) => ({ ...item, summary: cleanRawSummary(item.summary) }));
  const sorted = capAndFilterRecent(dedupeAndSort(cleaned), new Date(), 30, 100);
  const rewritten = await rewriteNewsItems(sorted);

  const snapshot: FallbackNewsSnapshot = {
    generatedAt: new Date().toISOString(),
    items: rewritten,
  };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Wrote ${rewritten.length} news items to ${SNAPSHOT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
