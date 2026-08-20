import "server-only";
import snapshot from "./data/fallback-snapshot.json";
import type { FallbackGapSnapshot } from "./types";

const typedSnapshot = snapshot as FallbackGapSnapshot;

export function getFallbackGapSnapshot(): FallbackGapSnapshot {
  return typedSnapshot;
}
