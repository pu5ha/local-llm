import type { Candidate, Judgement } from "../types";
import type { JudgeResponse } from "./schema";

/**
 * Maps verdicts back onto candidates by Ollama tag.
 *
 * Mirrors plainLanguage/applyRewriteResults: never throws, and a model
 * omission is not treated as a decision.
 *
 * - No verdict for a candidate: keep it, with judgement null. The caller then
 *   forces it down the PR path, since nothing vetted it.
 * - include === false: drop it. The model judged it unsuitable for beginners.
 * - Unknown tag in the response: ignored. The model cannot introduce a model
 *   that discovery didn't measure.
 */
export function applyJudgement(
  candidates: Candidate[],
  response: JudgeResponse | null
): Array<{ candidate: Candidate; judgement: Judgement | null }> {
  if (!response) {
    return candidates.map((candidate) => ({ candidate, judgement: null }));
  }

  const byTag = new Map(response.items.map((j) => [j.ollamaName, j]));

  return candidates.flatMap((candidate) => {
    const judgement = byTag.get(candidate.ollamaName) ?? null;
    if (judgement && judgement.include === false) return [];
    return [{ candidate, judgement }];
  });
}
