import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { buildRewritePrompt } from "./buildRewritePrompt";
import { applyRewriteResults } from "./applyRewriteResults";
import { RewriteResponseSchema, type RewriteResponse } from "./schema";
import {
  REWRITE_MODEL,
  REWRITE_BATCH_SIZE,
  REWRITE_TIMEOUT_MS,
  REWRITE_SYSTEM_PROMPT,
  chunk,
} from "./constants";
import type { NewsItem } from "../types";

async function rewriteBatch(
  client: Anthropic,
  batch: NewsItem[]
): Promise<NewsItem[]> {
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
    const parsed = message.parsed_output as RewriteResponse | null;
    return applyRewriteResults(batch, parsed);
  } catch (err) {
    console.warn("[news] plain-language rewrite batch failed, keeping raw text:", err);
    return batch;
  }
}

/**
 * Rewrites items into plain language via a fast/cheap model, batched to keep
 * each request small. Skips entirely (no network call) if no API key is
 * configured, and never throws — a failed or missing rewrite just leaves
 * items with their existing title/summary.
 */
export async function rewriteNewsItems(items: NewsItem[]): Promise<NewsItem[]> {
  if (!process.env.ANTHROPIC_API_KEY || items.length === 0) return items;

  const client = new Anthropic();
  const batches = chunk(items, REWRITE_BATCH_SIZE);
  const results = await Promise.all(batches.map((batch) => rewriteBatch(client, batch)));
  return results.flat();
}
