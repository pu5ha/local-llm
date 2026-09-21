import { getTierRoster } from "../catalog/recommend";
import { mergeCatalog } from "../catalog/mergeCatalog";
import type { CuratedModel, RamTierGB } from "../catalog/types";
import { classifyProposal, overallRisk } from "./classifyRisk";
import {
  MAX_MANIFEST_FAILURE_RATIO,
  MAX_MISSING_PULLS_RATIO,
  MIN_LIBRARY_ENTRIES,
  bucketCount,
} from "./constants";
import { chooseTags } from "./chooseTag";
import { excludeReasons } from "./eligibility";
import {
  CONCURRENCY,
  fetchLibrary,
  fetchManifest,
  fetchTags,
  mapLimit,
  resolveHf,
} from "./fetchOllama";
import { inferHfModelIds, MAX_HF_GUESSES } from "./inferHfModelId";
import { judgeCandidates } from "./judge/judgeCandidates";
import { parseRelativeAgeDays, parseSizeTag } from "./parseLibraryHtml";
import { heldBackReasons, proposeRoster, toCandidate } from "./shortlist";
import type {
  Candidate,
  Judgement,
  LibraryEntry,
  WatchReport,
  WatchSnapshot,
  WatchStatus,
} from "./types";

export interface RunDeps {
  fetchLibrary: typeof fetchLibrary;
  fetchTags: typeof fetchTags;
  fetchManifest: typeof fetchManifest;
  resolveHf: typeof resolveHf;
  judge: typeof judgeCandidates;
  now: () => Date;
}

export const liveDeps: RunDeps = {
  fetchLibrary,
  fetchTags,
  fetchManifest,
  resolveHf,
  judge: judgeCandidates,
  now: () => new Date(),
};

/**
 * One full model-watch run: discover, measure, shortlist, judge, classify.
 *
 * Never throws. A run that can't trust its inputs comes back with
 * status "degraded" and no proposals, which the caller turns into "write
 * nothing" — a broken upstream parse must not be able to change what the site
 * recommends.
 */
export async function runWatch(
  current: CuratedModel[],
  deps: RunDeps = liveDeps
): Promise<{ report: WatchReport; judgements: Judgement[]; candidates: Candidate[] }> {
  const generatedAt = deps.now().toISOString();
  const degradedReasons: string[] = [];

  const library = await deps.fetchLibrary();

  // Canary: the listing had ~240 entries when this was written. A markup
  // change shows up as a collapse in that count, and a partly-readable page is
  // never trusted — acting on a fraction of the catalogue would silently
  // "discover" that the best models no longer exist.
  if (library.length < MIN_LIBRARY_ENTRIES) {
    degradedReasons.push(
      `library listing parsed only ${library.length} entries (expected >= ${MIN_LIBRARY_ENTRIES}) — parser is probably broken`
    );
  }
  const missingPulls = library.filter((e) => e.pulls === 0).length;
  if (library.length > 0 && missingPulls / library.length > MAX_MISSING_PULLS_RATIO) {
    degradedReasons.push(
      `${missingPulls}/${library.length} library entries had no pull count — markup may have changed`
    );
  }

  if (degradedReasons.length > 0) {
    return {
      report: emptyReport(generatedAt, "degraded", degradedReasons, library.length),
      judgements: [],
      candidates: [],
    };
  }

  const eligible = library.filter((e) => excludeReasons(e).length === 0);

  // Resolve tags, then measure. Both are capped-concurrency so we stay a
  // polite client rather than hammering the registry.
  const tagLists = await mapLimit(eligible, CONCURRENCY, async (entry) => ({
    entry,
    tags: await deps.fetchTags(entry.family),
  }));

  const wanted: Array<{ entry: LibraryEntry; ollamaName: string; siblings: string[] }> = [];
  for (const { entry, tags } of tagLists) {
    for (const ollamaName of chooseTags(entry.family, tags)) {
      wanted.push({ entry, ollamaName, siblings: tags });
    }
  }

  const measured = await mapLimit(wanted, CONCURRENCY, async (w) => ({
    ...w,
    facts: await deps.fetchManifest(w.ollamaName),
  }));

  const resolvable = measured.filter((m) => m.facts !== null);
  if (measured.length > 0) {
    const failureRatio = 1 - resolvable.length / measured.length;
    // Cloud-only models legitimately fail here, so the bar is generous; this
    // catches a throttled or broken registry, not normal exclusions.
    if (failureRatio > MAX_MANIFEST_FAILURE_RATIO) {
      degradedReasons.push(
        `${Math.round(failureRatio * 100)}% of manifest lookups failed — registry may be throttling`
      );
    }
  }

  const candidates: Candidate[] = [];
  for (const m of resolvable) {
    const tag = m.ollamaName.split(":")[1] ?? "";
    const size = parseSizeTag(tag);
    if (!size) continue;

    const hf = await deps.resolveHf(
      inferHfModelIds(m.ollamaName, m.siblings).slice(0, MAX_HF_GUESSES)
    );

    candidates.push(
      toCandidate(m.facts!, {
        family: m.entry.family,
        pulls: m.entry.pulls,
        ageDays: parseRelativeAgeDays(m.entry.updatedText) ?? undefined,
        parametersB: size.parametersB,
        activeParametersB: size.activeParametersB,
        hfModelId: hf?.hfModelId ?? null,
        hfDownloads: hf?.downloads,
        hfLikes: hf?.likes,
        hfLastModified: hf?.lastModified,
        license: hf?.license,
      })
    );
  }

  const status: WatchStatus = degradedReasons.length > 0 ? "degraded" : "ok";

  const shortlisted = proposeRoster(current, candidates).map((p) => p.candidate);
  const incumbentByTag = (ollamaName: string) =>
    current.find((m) => m.ollamaName === ollamaName) ?? null;
  const { judged, didJudge } = await deps.judge(shortlisted, incumbentByTag);

  const judgements = judged
    .map((j) => j.judgement)
    .filter((j): j is Judgement => j !== null);
  const judgementFor = (ollamaName: string) =>
    judgements.find((j) => j.ollamaName === ollamaName) ?? null;

  // Re-propose against only the candidates the reviewer kept, so an excluded
  // model can't reach a proposal.
  const survivingTags = new Set(judged.map((j) => j.candidate.ollamaName));
  const proposals = proposeRoster(
    current,
    candidates.filter((c) => survivingTags.has(c.ollamaName) || !shortlisted.includes(c))
  )
    .filter((p) => survivingTags.has(p.candidate.ollamaName))
    .map((p) =>
      classifyProposal(p, {
        status,
        judged: didJudge,
        judgementFor,
        incumbentFor: (id) => current.find((m) => m.id === id) ?? null,
        // Release recency comes from Hugging Face, not from Ollama's
        // "Updated" text — see Candidate.hfLastModified for why.
        releaseDateFor: (ollamaName) =>
          candidates.find((c) => c.ollamaName === ollamaName)?.hfLastModified ?? null,
      })
    );

  const roster = getTierRoster(mergeCatalog(current, [], "fallback-snapshot").models);
  const tierGaps = roster.filter((r) => !r.isDistinct).map((r) => r.ramGB);

  return {
    report: {
      generatedAt,
      status,
      degradedReasons,
      librarySize: library.length,
      candidateCount: candidates.length,
      proposals,
      risk: overallRisk(proposals),
      tierGaps,
    },
    judgements,
    candidates,
  };
}

/**
 * The committed audit trail. Volatile numbers are bucketed rather than exact:
 * the risk thresholds only need magnitudes, and committing exact pull counts
 * would rewrite this file every single week for no decision value.
 */
export function toSnapshot(
  report: WatchReport,
  current: CuratedModel[],
  candidates: Candidate[]
): WatchSnapshot {
  const roster = getTierRoster(mergeCatalog(current, [], "fallback-snapshot").models);
  return {
    generatedAt: report.generatedAt,
    status: report.status,
    tiers: roster.map((r) => ({
      ramGB: r.ramGB,
      ollamaName: r.pick?.ollamaName ?? null,
      ramRequiredGB: r.pick?.ramRequiredGB ?? null,
    })),
    watching: candidates
      .filter((c) => c.fitsTier !== null)
      .map((c) => {
        const incumbent =
          current.find((m) => m.recommendedForRamGB === c.fitsTier) ?? null;
        return {
          ollamaName: c.ollamaName,
          pullsBucket: bucketCount(c.pulls),
          ramRequiredGB: c.ramRequiredGB,
          fitsTier: c.fitsTier,
          // Pass the roster too, or the snapshot shows a model as eligible
          // that the pipeline correctly refused to move (qwen3.6:35b is
          // curated at 64GB but technically squeezes into 32GB).
          heldBack: heldBackReasons(c, incumbent, current),
        };
      })
      .sort((a, b) => a.ollamaName.localeCompare(b.ollamaName)),
  };
}

function emptyReport(
  generatedAt: string,
  status: WatchStatus,
  degradedReasons: string[],
  librarySize: number
): WatchReport {
  return {
    generatedAt,
    status,
    degradedReasons,
    librarySize,
    candidateCount: 0,
    proposals: [],
    risk: "review",
    tierGaps: [] as RamTierGB[],
  };
}
