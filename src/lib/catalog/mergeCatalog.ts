import type {
  Catalog,
  CuratedModel,
  FactsSource,
  Model,
  ModelFacts,
  UncuratedModel,
} from "./types";

/** KV cache + runtime buffers, as a multiple of the weights. */
const RUNTIME_OVERHEAD_FACTOR = 1.25;
/**
 * Reserved for the OS, browser and background apps. Folded into ramRequiredGB so
 * that number means "total system RAM this model needs" — which is both what a
 * beginner actually wants to know and what lets a tier be compared directly
 * against it, with no second subtraction step elsewhere.
 */
const OS_RESERVE_GB = 3;

/**
 * Fallback sizing for entries with no measured `weightsGB`. Assumes Q4_K_M (the
 * Ollama default): ~0.5 bytes/param, plus runtime overhead.
 */
export function estimateRamForParams(parametersB: number): number {
  const weightsGB = parametersB * 0.5;
  return Math.ceil(weightsGB * RUNTIME_OVERHEAD_FACTOR);
}

/**
 * Total system RAM a model needs, in GB. Prefers the measured Ollama layer size;
 * falls back to the parameter estimate (without an OS reserve, preserving the
 * historical numbers) for entries the model-watch pipeline hasn't measured yet.
 */
export function ramRequiredFor(model: CuratedModel): number {
  if (typeof model.weightsGB !== "number") {
    return estimateRamForParams(model.parametersB);
  }
  return Math.ceil(model.weightsGB * RUNTIME_OVERHEAD_FACTOR) + OS_RESERVE_GB;
}

function formatParams(parametersB: number): string {
  return Number.isInteger(parametersB)
    ? `${parametersB}B`
    : `${parametersB.toFixed(1)}B`;
}

function displayNameFromHfId(hfModelId: string): string {
  const repo = hfModelId.split("/").pop() ?? hfModelId;
  return repo.replace(/[-_]/g, " ");
}

export function mergeCatalog(
  curated: CuratedModel[],
  facts: ModelFacts[],
  factsSource: Exclude<FactsSource, "missing">,
  previousUncurated: Array<Omit<UncuratedModel, "name">> = []
): Catalog {
  // Join case-insensitively. Hugging Face 307-redirects to a canonical
  // casing — google/gemma-4-12b-it becomes google/gemma-4-12B-it — so an
  // exact-match join silently drops every fact for that model and files it as
  // uncurated instead, with no error anywhere.
  const factsById = new Map(facts.map((f) => [f.hfModelId.toLowerCase(), f]));
  const curatedIds = new Set(curated.map((c) => c.hfModelId.toLowerCase()));
  const previousFirstSeen = new Map(
    previousUncurated.map((u) => [u.hfModelId.toLowerCase(), u.firstSeenAt])
  );

  const models: Model[] = curated.map((c) => {
    const ramRequiredGB = ramRequiredFor(c);
    const sizing = {
      parameters: formatParams(c.parametersB),
      ramRequiredGB,
      ramRequired: `${ramRequiredGB}GB`,
      ramSource: (typeof c.weightsGB === "number" ? "measured" : "estimated") as
        | "measured"
        | "estimated",
    };
    const found = factsById.get(c.hfModelId.toLowerCase());
    if (found) {
      return { ...c, ...sizing, ...found, factsSource };
    }
    return { ...c, ...sizing, factsSource: "missing" };
  });

  const now = new Date().toISOString();
  const uncurated: UncuratedModel[] = facts
    .filter((f) => !curatedIds.has(f.hfModelId.toLowerCase()))
    .map((f) => ({
      ...f,
      name: displayNameFromHfId(f.hfModelId),
      firstSeenAt: previousFirstSeen.get(f.hfModelId.toLowerCase()) ?? now,
    }));

  return {
    models,
    uncurated,
    meta: {
      fetchedAt: now,
      source: factsSource,
    },
  };
}
