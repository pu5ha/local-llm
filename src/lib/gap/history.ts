import "server-only";
import historyFile from "./data/history.json";
import type { GapHistoryFile, GapHistoryPoint } from "./types";

const typedHistory = historyFile as GapHistoryFile;

export function getGapHistory(): GapHistoryPoint[] {
  return typedHistory.points;
}
