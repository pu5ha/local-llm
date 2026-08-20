import type { ClassifiedModel, CurrentGap, GapLeader } from "./types";

function toLeader(m: ClassifiedModel): GapLeader {
  return {
    name: m.name,
    creatorName: m.creatorName,
    slug: m.slug,
    intelligenceIndex: m.intelligenceIndex,
  };
}

/**
 * Picks the highest-scoring model on each side of the open/closed split.
 * Returns null (never throws) if either side has no classified models —
 * callers decide fallback behavior.
 */
export function computeCurrentGap(models: ClassifiedModel[]): CurrentGap | null {
  const open = models.filter((m) => m.openness === "open");
  const closed = models.filter((m) => m.openness === "closed");
  if (open.length === 0 || closed.length === 0) return null;

  const openLeader = open.reduce((a, b) => (b.intelligenceIndex > a.intelligenceIndex ? b : a));
  const closedLeader = closed.reduce((a, b) => (b.intelligenceIndex > a.intelligenceIndex ? b : a));

  return {
    // Not clamped to 0 — an open model briefly leading is preserved, not hidden.
    gapPoints: Math.round((closedLeader.intelligenceIndex - openLeader.intelligenceIndex) * 10) / 10,
    openLeader: toLeader(openLeader),
    closedLeader: toLeader(closedLeader),
  };
}

/**
 * Full ranked list mixing open + closed models by score, for the leaderboard.
 * This is the whole point of the redesign: rank order makes it obvious how
 * open models are interleaved among closed ones, not just "the two leaders."
 */
export function buildLeaderboard(models: ClassifiedModel[], limit = 15): ClassifiedModel[] {
  return [...models]
    .sort((a, b) => b.intelligenceIndex - a.intelligenceIndex)
    .slice(0, limit);
}
