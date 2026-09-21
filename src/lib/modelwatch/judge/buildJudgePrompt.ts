import type { Candidate } from "../types";
import type { CuratedModel } from "../../catalog/types";

/**
 * The payload sent to the review model. Facts are stated, never requested —
 * the model is told the measured numbers so it can reason about fit, and its
 * response schema has no field in which to restate them.
 */
export function buildJudgePrompt(
  candidates: Candidate[],
  incumbentFor: (ollamaName: string) => CuratedModel | null
) {
  return {
    candidates: candidates.map((c) => {
      const incumbent = incumbentFor(c.ollamaName);
      return {
        ollamaName: c.ollamaName,
        family: c.family,
        measuredDownloadGB: c.residentGB,
        totalParametersB: c.parametersB,
        activeParametersB: c.activeParametersB ?? c.parametersB,
        isMixtureOfExperts: c.activeParametersB !== undefined,
        acceptsImages: c.visionCapable,
        needsSystemRamGB: c.ramRequiredGB,
        forRamTierGB: c.fitsTier,
        huggingFaceId: c.hfModelId,
        huggingFaceDownloads: c.hfDownloads ?? null,
        huggingFaceLikes: c.hfLikes ?? null,
        license: c.license ?? null,
        wouldReplace: incumbent
          ? { ollamaName: incumbent.ollamaName, name: incumbent.name }
          : null,
      };
    }),
  };
}
