import { z } from "zod";

export const RewrittenItemSchema = z.object({
  url: z.string(),
  plainTitle: z.string(),
  plainSummary: z.string(),
});

export const RewriteResponseSchema = z.object({
  items: z.array(RewrittenItemSchema),
});

export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;
