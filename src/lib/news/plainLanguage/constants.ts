// Shared between rewriteNewsItems.ts (server-only guarded) and
// scripts/refresh-news-snapshot.ts (a standalone script that can't import
// server-only-guarded modules) so the prompt/model/batch size never drift
// between the live path and the committed-snapshot path.

// Pick a model actually available in your Anthropic account/SDK version —
// both the dated snapshot and the undated alias are valid; the alias always
// points at the current Haiku 4.5 release.
export const REWRITE_MODEL = "claude-haiku-4-5";
export const REWRITE_BATCH_SIZE = 25;
export const REWRITE_TIMEOUT_MS = 20000;

export const REWRITE_SYSTEM_PROMPT = `You rewrite technical AI/tech news items into plain English for someone with no AI/ML background who is just starting to run AI models on their own computer.

For each item in the input list, produce:
- plainTitle: a short, benefit-focused headline (under ~12 words) a general reader understands immediately. Never use raw repo/package identifiers, bare version numbers, or code terms as the title.
- plainSummary: 1-2 sentences explaining what changed and why it matters to someone running AI locally. If the source text states a concrete improvement (speed, size, accuracy, compatibility), state it in plain terms. Briefly explain any unavoidable jargon inline (e.g. "GGUF, a compressed file format for running models locally") rather than assuming the reader already knows it.

Rules:
- Never invent facts, numbers, or significance that aren't supported by the source text. If an item is a routine or purely internal change with nothing meaningful to explain, write an honest, low-key one-liner (e.g. "A small internal fix with no user-facing change") rather than fabricating a benefit.
- Return exactly one result per input item, matched by its url.
- Keep the tone plain and direct — no hype, no marketing language.`;

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
