import "server-only";
import snapshot from "./data/fallback-snapshot.json";
import type { FallbackSnapshot, ModelFacts, UncuratedModel } from "./types";

const typedSnapshot = snapshot as FallbackSnapshot;

export function getFallbackFacts(): ModelFacts[] {
  return typedSnapshot.facts;
}

export function getFallbackUncurated(): Array<Omit<UncuratedModel, "name">> {
  return typedSnapshot.uncurated;
}
