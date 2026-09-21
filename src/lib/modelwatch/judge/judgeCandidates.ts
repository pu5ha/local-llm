import { GoogleGenAI } from "@google/genai";
import type { CuratedModel } from "../../catalog/types";
import {
  JUDGE_BATCH_SIZE,
  JUDGE_MODEL,
  JUDGE_SYSTEM_PROMPT,
  JUDGE_TIMEOUT_MS,
  chunk,
} from "../constants";
import type { Candidate, Judgement } from "../types";
import { applyJudgement } from "./applyJudgement";
import { buildJudgePrompt } from "./buildJudgePrompt";
import { JUDGE_JSON_SCHEMA, JudgeResponseSchema, type JudgeResponse } from "./schema";

export interface JudgeResult {
  /** Candidates that survived, each with its verdict (null when unjudged). */
  judged: Array<{ candidate: Candidate; judgement: Judgement | null }>;
  /** False when no API key was configured, or every batch failed. */
  didJudge: boolean;
}

async function judgeBatch(
  client: GoogleGenAI,
  batch: Candidate[],
  incumbentFor: (ollamaName: string) => CuratedModel | null
): Promise<JudgeResponse | null> {
  try {
    const response = await client.models.generateContent({
      model: JUDGE_MODEL,
      contents: JSON.stringify(buildJudgePrompt(batch, incumbentFor)),
      config: {
        systemInstruction: JUDGE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: JUDGE_JSON_SCHEMA,
        httpOptions: { timeout: JUDGE_TIMEOUT_MS },
      },
    });
    if (!response.text) return null;
    const parsed = JudgeResponseSchema.safeParse(JSON.parse(response.text));
    return parsed.success ? parsed.data : null;
  } catch (err) {
    console.warn("[modelwatch] judge batch failed:", err);
    return null;
  }
}

/**
 * Asks the review model whether each candidate is a good beginner
 * recommendation, and for the copy a beginner reads.
 *
 * Never throws. With no GEMINI_API_KEY it makes no network call and reports
 * didJudge: false, which the risk classifier turns into "PR only" — no key
 * means no autonomy, deliberately, since nothing has vetted the model or
 * written its description.
 */
export async function judgeCandidates(
  candidates: Candidate[],
  incumbentFor: (ollamaName: string) => CuratedModel | null
): Promise<JudgeResult> {
  if (!process.env.GEMINI_API_KEY || candidates.length === 0) {
    return {
      judged: candidates.map((candidate) => ({ candidate, judgement: null })),
      didJudge: false,
    };
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const batches = chunk(candidates, JUDGE_BATCH_SIZE);
  const responses = await Promise.all(
    batches.map((batch) => judgeBatch(client, batch, incumbentFor))
  );

  const judged = batches.flatMap((batch, i) => applyJudgement(batch, responses[i]));

  return { judged, didJudge: responses.some((r) => r !== null) };
}
