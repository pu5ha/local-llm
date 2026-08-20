import "server-only";
import { GoogleGenAI } from "@google/genai";
import { buildRewritePrompt } from "./buildRewritePrompt";
import { applyRewriteResults } from "./applyRewriteResults";
import { RewriteResponseSchema, REWRITE_JSON_SCHEMA, type RewriteResponse } from "./schema";
import {
  REWRITE_MODEL,
  REWRITE_BATCH_SIZE,
  REWRITE_TIMEOUT_MS,
  REWRITE_SYSTEM_PROMPT,
  chunk,
} from "./constants";
import type { NewsItem } from "../types";

async function rewriteBatch(client: GoogleGenAI, batch: NewsItem[]): Promise<NewsItem[]> {
  try {
    const payload = buildRewritePrompt(batch);
    const response = await client.models.generateContent({
      model: REWRITE_MODEL,
      contents: JSON.stringify(payload),
      config: {
        systemInstruction: REWRITE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: REWRITE_JSON_SCHEMA,
        httpOptions: { timeout: REWRITE_TIMEOUT_MS },
      },
    });
    if (!response.text) return batch;
    const parsed = RewriteResponseSchema.safeParse(JSON.parse(response.text));
    if (!parsed.success) return batch;
    return applyRewriteResults(batch, parsed.data as RewriteResponse);
  } catch (err) {
    console.warn("[news] plain-language rewrite batch failed, keeping raw text:", err);
    return batch;
  }
}

/**
 * Rewrites items into plain language via Gemini's free tier, batched to keep
 * each request small. Skips entirely (no network call) if no API key is
 * configured, and never throws — a failed or missing rewrite just leaves
 * items with their existing title/summary.
 */
export async function rewriteNewsItems(items: NewsItem[]): Promise<NewsItem[]> {
  if (!process.env.GEMINI_API_KEY || items.length === 0) return items;

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const batches = chunk(items, REWRITE_BATCH_SIZE);
  const results = await Promise.all(batches.map((batch) => rewriteBatch(client, batch)));
  return results.flat();
}
