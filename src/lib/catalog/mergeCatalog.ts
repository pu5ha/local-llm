import type {
  Catalog,
  CuratedModel,
  FactsSource,
  Model,
  ModelFacts,
  UncuratedModel,
} from "./types";

/**
 * Assumes Q4_K_M quantization (the Ollama default): ~0.5 bytes/param for
 * weights, plus ~25% overhead for KV cache and runtime buffers.
 */
export function estimateRamForParams(parametersB: number): number {
  const weightsGB = parametersB * 0.5;
  return Math.ceil(weightsGB * 1.25);
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
  const factsById = new Map(facts.map((f) => [f.hfModelId, f]));
  const curatedIds = new Set(curated.map((c) => c.hfModelId));
  const previousFirstSeen = new Map(
    previousUncurated.map((u) => [u.hfModelId, u.firstSeenAt])
  );

  const models: Model[] = curated.map((c) => {
    const ramRequiredGB = estimateRamForParams(c.parametersB);
    const sizing = {
      parameters: formatParams(c.parametersB),
      ramRequiredGB,
      ramRequired: `${ramRequiredGB}GB`,
    };
    const found = factsById.get(c.hfModelId);
    if (found) {
      return { ...c, ...sizing, ...found, factsSource };
    }
    return { ...c, ...sizing, factsSource: "missing" };
  });

  const now = new Date().toISOString();
  const uncurated: UncuratedModel[] = facts
    .filter((f) => !curatedIds.has(f.hfModelId))
    .map((f) => ({
      ...f,
      name: displayNameFromHfId(f.hfModelId),
      firstSeenAt: previousFirstSeen.get(f.hfModelId) ?? now,
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
