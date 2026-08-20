import type { Openness } from "./types";

/**
 * Hand-maintained open/closed classification, keyed by Artificial Analysis
 * creator slug. The AA free tier has no `is_open_weights` flag, so this is
 * the only source of truth for "open vs closed" — like curated.ts, it only
 * ever changes by direct owner edit.
 *
 * Spot-check creator slugs against a live API response at review time — AA
 * has renamed/merged creator slugs before (e.g. a "zhipu" -> "z-ai" rebrand).
 */
export const creatorClassification: Record<string, Openness> = {
  meta: "open",
  "meta-llama": "open",
  mistral: "open",
  "mistral-ai": "open",
  alibaba: "open",
  qwen: "open",
  deepseek: "open",
  "deepseek-ai": "open",
  moonshot: "open",
  "moonshot-ai": "open",
  kimi: "open",
  minimax: "open",
  zhipu: "open",
  "z-ai": "open",
  glm: "open",
  nvidia: "open",
  xiaomi: "open",
  "allen-ai": "open",
  ai2: "open",

  google: "closed", // Gemini — Gemma overridden below
  microsoft: "closed", // proprietary Copilot-adjacent — Phi overridden below
  openai: "closed",
  anthropic: "closed",
  xai: "closed",
  amazon: "closed",
};

/** Checked before the creator map — handles creators that ship both. */
const modelNameOverrides: Array<{ pattern: RegExp; openness: Openness }> = [
  { pattern: /^gemma/i, openness: "open" },
  { pattern: /^gemini/i, openness: "closed" },
  { pattern: /^phi[-\s]?\d/i, openness: "open" },
];

/** Returns null when the creator/model is unrecognized — caller should flag it for review. */
export function classifyModel(
  creatorSlug: string,
  creatorName: string,
  modelName: string
): Openness | null {
  const override = modelNameOverrides.find((o) => o.pattern.test(modelName));
  if (override) return override.openness;
  const key = (creatorSlug || creatorName).toLowerCase();
  return creatorClassification[key] ?? null;
}
