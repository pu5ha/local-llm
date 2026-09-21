import type { CuratedModel } from "../catalog/types";
import type { Judgement, Proposal } from "./types";

/**
 * Fixed key order for every entry written to curated.json.
 *
 * Emitting keys in a stable order — rather than whatever order an object
 * happened to be built in — is what makes a re-run with no upstream change
 * produce a byte-identical file. Without it every run reshuffles keys and the
 * diff is noise.
 */
const KEY_ORDER: Array<keyof CuratedModel> = [
  "id",
  "ollamaName",
  "hfModelId",
  "lmStudioName",
  "name",
  "provider",
  "description",
  "bestFor",
  "quality",
  "speed",
  "featured",
  "recommendedForRamGB",
  "curatedAt",
  "parametersB",
  "activeParametersB",
  "weightsGB",
  "visionCapable",
];

function orderKeys(model: CuratedModel): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of KEY_ORDER) {
    const value = model[key];
    if (value !== undefined) out[key] = value;
  }
  // Anything not in KEY_ORDER is preserved rather than silently dropped, so a
  // field added by hand survives an automated rewrite.
  const raw = model as unknown as Record<string, unknown>;
  for (const key of Object.keys(raw).sort()) {
    if (!(key in out) && raw[key] !== undefined) out[key] = raw[key];
  }
  return out;
}

/** Canonical JSON for src/lib/catalog/data/curated.json. */
export function serializeCurated(models: CuratedModel[]): string {
  const sorted = [...models].sort(
    (a, b) => a.parametersB - b.parametersB || a.id.localeCompare(b.id)
  );
  return `${JSON.stringify(sorted.map(orderKeys), null, 2)}\n`;
}

/** Stable slug from an Ollama tag: "qwen3.6:35b-a3b" -> "qwen3.6-35b-a3b". */
export function idFor(ollamaName: string): string {
  return ollamaName.replace(":", "-");
}

/**
 * Applies accepted proposals to the roster.
 *
 * The displaced model is kept as an un-featured alternate rather than deleted:
 * /models stays a useful browse list, and a reader who already downloaded it
 * still finds it described. Only its tier ownership moves.
 */
export function applyProposals(
  current: CuratedModel[],
  proposals: Proposal[],
  judgementFor: (ollamaName: string) => Judgement | null,
  today: string
): CuratedModel[] {
  let roster = [...current];

  for (const proposal of proposals) {
    if (proposal.risk === "blocked" || proposal.tier === null) continue;
    const { candidate } = proposal;

    roster = roster.map((m) =>
      m.recommendedForRamGB === proposal.tier
        ? { ...m, featured: undefined, recommendedForRamGB: undefined }
        : m
    );

    const judgement = judgementFor(candidate.ollamaName);
    const existing = roster.find((m) => m.ollamaName === candidate.ollamaName);

    const entry: CuratedModel = {
      id: existing?.id ?? idFor(candidate.ollamaName),
      ollamaName: candidate.ollamaName,
      hfModelId: candidate.hfModelId ?? existing?.hfModelId ?? "",
      name: judgement?.displayName ?? existing?.name ?? candidate.ollamaName,
      provider: judgement?.provider ?? existing?.provider ?? "Unknown",
      description:
        judgement?.description ??
        existing?.description ??
        `${candidate.parametersB}B model. Needs about ${candidate.ramRequiredGB}GB of RAM.`,
      bestFor: judgement?.bestFor ?? existing?.bestFor ?? ["General chat"],
      quality: judgement?.quality ?? existing?.quality ?? "great",
      speed: judgement?.speed ?? existing?.speed ?? "medium",
      featured: true,
      recommendedForRamGB: proposal.tier,
      curatedAt: today,
      parametersB: candidate.parametersB,
      weightsGB: candidate.residentGB,
      visionCapable: candidate.visionCapable,
      ...(candidate.activeParametersB !== undefined
        ? { activeParametersB: candidate.activeParametersB }
        : {}),
      ...(existing?.lmStudioName ? { lmStudioName: existing.lmStudioName } : {}),
    };

    roster = existing
      ? roster.map((m) => (m.ollamaName === candidate.ollamaName ? entry : m))
      : [...roster, entry];
  }

  return roster;
}
