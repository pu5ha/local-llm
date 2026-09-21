import { z } from "zod";

/**
 * The review model's output schema.
 *
 * Note what is NOT here: no size, tag, parameter count, RAM figure or
 * download number. Those are measured from the Ollama registry and the
 * Hugging Face API, and the model is structurally unable to contradict them
 * because there is nowhere for it to put such a value. It judges suitability
 * and writes prose; it is never a source of facts.
 */
export const JudgementSchema = z.object({
  ollamaName: z.string(),
  include: z.boolean(),
  isBeginnerChatModel: z.boolean(),
  displayName: z.string(),
  provider: z.string(),
  description: z.string(),
  bestFor: z.array(z.string()),
  quality: z.enum(["excellent", "great", "good"]),
  speed: z.enum(["fast", "medium", "slow"]),
  confidence: z.enum(["high", "low"]),
  reason: z.string(),
});

export const JudgeResponseSchema = z.object({
  items: z.array(JudgementSchema),
});

export type JudgeResponse = z.infer<typeof JudgeResponseSchema>;

// Gemini's responseJsonSchema takes a restricted JSON Schema subset directly,
// so the Zod schema doubles as the request schema. $schema isn't in its
// supported-keys list — same handling as plainLanguage/schema.ts.
const judgeJsonSchema: Record<string, unknown> = z.toJSONSchema(JudgeResponseSchema);
delete judgeJsonSchema.$schema;
export const JUDGE_JSON_SCHEMA = judgeJsonSchema;
