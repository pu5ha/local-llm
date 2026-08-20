import { z } from "zod";

export const RewrittenItemSchema = z.object({
  url: z.string(),
  plainTitle: z.string(),
  plainSummary: z.string(),
  // Whether this item is genuinely newsworthy to a general reader, vs.
  // routine/internal noise or a near-duplicate of a more significant item
  // in the same batch. See applyRewriteResults.ts for how this is applied.
  include: z.boolean(),
});

export const RewriteResponseSchema = z.object({
  items: z.array(RewrittenItemSchema),
});

export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;

/**
 * Gemini's `responseJsonSchema` accepts a real (restricted-subset) JSON
 * Schema directly, so the Zod schema doubles as the request schema too —
 * no separate hand-written schema to keep in sync. Strip `$schema`: it's
 * not in Gemini's documented supported-keys list.
 */
const rewriteJsonSchema: Record<string, unknown> = z.toJSONSchema(RewriteResponseSchema);
delete rewriteJsonSchema.$schema;
export const REWRITE_JSON_SCHEMA = rewriteJsonSchema;
