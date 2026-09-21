import { ramRequiredFor } from "../catalog/mergeCatalog";
import type { CuratedModel } from "../catalog/types";
import { DOWNGRADE_TOLERANCE, LICENSE_ALLOWLIST } from "./constants";
import { family, lineage, sizeClass } from "./shortlist";
import type { Judgement, Proposal, Risk, WatchStatus } from "./types";

export interface RiskContext {
  status: WatchStatus;
  /** False when GEMINI_API_KEY was absent, so no model vetted the candidate. */
  judged: boolean;
  judgementFor: (ollamaName: string) => Judgement | null;
  incumbentFor: (id: string | null) => CuratedModel | null;
  /** ISO date the model was released/last modified on Hugging Face, if known. */
  releaseDateFor: (ollamaName: string) => string | null;
}

/**
 * Decides whether a proposal can be committed straight to main or needs a
 * human on it.
 *
 * "low" is reserved for the case the owner explicitly signed off on: a newer
 * release of a family already being recommended, at the same size class, still
 * fitting the same tier. That is the boring version-bump case — qwen3.6:27b
 * becoming qwen3.7:27b — where waiting for a human just means readers get
 * stale advice for a week.
 *
 * Everything else is a PR, and anything that would make a tier's advice
 * *worse* is blocked outright rather than offered.
 */
export function classifyProposal(proposal: Proposal, ctx: RiskContext): Proposal {
  const blocking = blockingReasons(proposal, ctx);
  if (blocking.length > 0) {
    return { ...proposal, risk: "blocked", reasons: [...proposal.reasons, ...blocking] };
  }

  const escalations = escalationReasons(proposal, ctx);
  if (escalations.length > 0) {
    return { ...proposal, risk: "review", reasons: [...proposal.reasons, ...escalations] };
  }

  return {
    ...proposal,
    risk: "low",
    reasons: [
      ...proposal.reasons,
      "same family, same size class, same tier — routine version bump",
    ],
  };
}

/** Never even offered: the proposal would degrade the advice. */
function blockingReasons(proposal: Proposal, ctx: RiskContext): string[] {
  const reasons: string[] = [];
  const { candidate, tier } = proposal;

  if (tier === null || candidate.fitsTier !== tier) {
    reasons.push("does not fit the tier it was proposed for");
  }
  if (tier !== null && candidate.ramRequiredGB > tier) {
    reasons.push(
      `needs ${candidate.ramRequiredGB}GB, more than the ${tier}GB tier has`
    );
  }
  if (!candidate.hfModelId) {
    reasons.push("no verified Hugging Face repo id");
  }

  const incumbent = ctx.incumbentFor(proposal.incumbentId);
  if (
    incumbent &&
    candidate.residentGB < (incumbent.weightsGB ?? 0) * DOWNGRADE_TOLERANCE
  ) {
    reasons.push(
      `meaningfully smaller than the model it would replace ` +
        `(${candidate.residentGB}GB vs ${incumbent.weightsGB}GB)`
    );
  }

  return reasons;
}

/** Needs a human: plausible, but not the routine case. */
function escalationReasons(proposal: Proposal, ctx: RiskContext): string[] {
  const reasons: string[] = [];
  const { candidate } = proposal;

  if (ctx.status !== "ok") {
    reasons.push("run was degraded — upstream data only partly readable");
  }
  if (!ctx.judged) {
    reasons.push("no GEMINI_API_KEY, so nothing vetted this model or wrote its copy");
  }

  const judgement = ctx.judgementFor(candidate.ollamaName);
  if (ctx.judged && !judgement) {
    reasons.push("review model returned no verdict for this candidate");
  }
  if (judgement && judgement.confidence !== "high") {
    reasons.push("review model was not confident it recognised this model");
  }
  if (judgement && !judgement.isBeginnerChatModel) {
    reasons.push("may not be a good first experience for a beginner");
  }

  if (candidate.license && !LICENSE_ALLOWLIST.includes(candidate.license.toLowerCase())) {
    reasons.push(`license "${candidate.license}" is not on the allowlist`);
  }

  if (proposal.kind === "add-model") {
    reasons.push("fills a previously empty tier — first-time recommendation");
  }

  const incumbent = ctx.incumbentFor(proposal.incumbentId);
  if (incumbent) {
    if (lineage(candidate.ollamaName) !== lineage(incumbent.ollamaName)) {
      reasons.push(
        `switches family: ${lineage(incumbent.ollamaName)} -> ${lineage(candidate.ollamaName)}`
      );
    }
    if (sizeClass(candidate.parametersB) !== sizeClass(incumbent.parametersB)) {
      reasons.push(
        `changes size class: ${sizeClass(incumbent.parametersB)} -> ${sizeClass(candidate.parametersB)}`
      );
    }
    // A higher version number does not by itself mean newer — publishers
    // maintain several lines at once. So a version bump is only routine when
    // the challenger was actually released more recently than the model it
    // replaces; otherwise a person decides.
    const candidateDate = ctx.releaseDateFor(candidate.ollamaName);
    const incumbentDate = ctx.releaseDateFor(incumbent.ollamaName);
    if (candidateDate !== null && incumbentDate !== null && candidateDate < incumbentDate) {
      reasons.push(
        `higher version number but released before ${family(incumbent.ollamaName)} ` +
          `(${candidateDate.slice(0, 10)} vs ${incumbentDate.slice(0, 10)})`
      );
    }

    const denseToMoe =
      (incumbent.activeParametersB === undefined) !==
      (candidate.activeParametersB === undefined);
    if (denseToMoe) {
      reasons.push("switches between a dense and a Mixture-of-Experts model");
    }
    if (ramRequiredFor(incumbent) === candidate.ramRequiredGB && incumbent.weightsGB === candidate.residentGB) {
      reasons.push("identical size to the incumbent — probably a re-tag");
    }
  }

  return reasons;
}

/**
 * The run's overall risk, which decides commit vs PR. Deliberately the worst
 * risk across all proposals, and "review" as soon as more than one tier moves:
 * several tiers changing at once means something upstream shifted broadly and
 * a person should look before readers see it.
 */
export function overallRisk(proposals: Proposal[]): Risk {
  const actionable = proposals.filter((p) => p.risk !== "blocked");
  if (actionable.length === 0) return proposals.length > 0 ? "blocked" : "low";
  if (actionable.some((p) => p.risk === "review")) return "review";
  if (actionable.filter((p) => p.kind !== "facts-only").length > 1) return "review";
  return "low";
}
