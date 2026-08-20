/**
 * Regenerates src/lib/gap/data/fallback-snapshot.json from the live
 * Artificial Analysis Data API, and appends/updates today's row in
 * src/lib/gap/data/history.json. Run with `npm run gap:snapshot` (requires
 * ARTIFICIAL_ANALYSIS_API_KEY) and commit the diff.
 */
import fs from "node:fs";
import path from "node:path";
import { classifyAndReduce } from "../src/lib/gap/fetchAaModels";
import { computeCurrentGap } from "../src/lib/gap/computeGap";
import type { AaModelRecord, FallbackGapSnapshot, GapHistoryFile } from "../src/lib/gap/types";

const AA_API_URL = "https://artificialanalysis.ai/api/v2/language/models/free";
const SNAPSHOT_PATH = path.join(__dirname, "../src/lib/gap/data/fallback-snapshot.json");
const HISTORY_PATH = path.join(__dirname, "../src/lib/gap/data/history.json");

async function main() {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  if (!apiKey) throw new Error("Set ARTIFICIAL_ANALYSIS_API_KEY to run this script");

  const res = await fetch(AA_API_URL, { headers: { "x-api-key": apiKey } });
  if (!res.ok) throw new Error(`Artificial Analysis API returned ${res.status}`);
  const json = await res.json();
  const records: AaModelRecord[] = Array.isArray(json) ? json : json.data;

  const { classified, unclassified } = classifyAndReduce(records);

  const generatedAt = new Date().toISOString();
  const snapshot: FallbackGapSnapshot = { generatedAt, models: classified, unclassified };
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + "\n");

  const current = computeCurrentGap(classified);
  if (current) {
    const history: GapHistoryFile = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));
    const today = generatedAt.slice(0, 10);
    const withoutToday = history.points.filter((p) => p.date !== today); // idempotent re-runs same day
    history.points = [
      ...withoutToday,
      {
        date: today,
        gapPoints: current.gapPoints,
        openLeader: current.openLeader.name,
        closedLeader: current.closedLeader.name,
        sourceUrl: "https://artificialanalysis.ai/",
        sourceLabel: "Artificial Analysis Intelligence Index (auto-recorded by localllm)",
      },
    ].sort((a, b) => a.date.localeCompare(b.date));
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2) + "\n");
  } else {
    console.warn("[gap:snapshot] no open+closed pair found in live data — history not updated");
  }

  console.log(
    `Wrote ${classified.length} classified models (${unclassified.length} unclassified) to ${SNAPSHOT_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
