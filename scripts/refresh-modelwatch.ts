/**
 * Model watch: discovers newly released open-weights models that a beginner
 * could actually run locally, and updates the per-RAM-tier recommendations.
 *
 *   npm run models:watch              # report only, writes nothing
 *   npm run models:watch -- --apply   # also update curated.json + snapshot
 *   npm run models:watch -- --report out.json
 *
 * Reads:  ollama.com/library, registry.ollama.ai manifests, huggingface.co API
 * Writes: src/lib/catalog/data/curated.json (only with --apply)
 *         src/lib/modelwatch/data/watch-snapshot.json (only with --apply)
 *
 * The exit code is meaningful, because .github/workflows/model-watch.yml
 * branches on it:
 *   0  ran fine (whether or not anything changed)
 *   1  degraded — an upstream source was unreadable, nothing was written
 *
 * Sizing and risk rules live in src/lib/modelwatch/, not here, so the pure
 * logic stays unit-testable and this file stays a thin CLI.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { curatedModels } from "../src/lib/catalog/curated";
import { applyProposals, serializeCurated } from "../src/lib/modelwatch/serializeCurated";
import { runWatch, toSnapshot } from "../src/lib/modelwatch/runWatch";
import { formatWatchMessage } from "../src/lib/modelwatch/formatWatchMessage";
import type { Proposal, WatchReport } from "../src/lib/modelwatch/types";

const ROOT = join(__dirname, "..");
const CURATED_PATH = join(ROOT, "src/lib/catalog/data/curated.json");
const SNAPSHOT_PATH = join(ROOT, "src/lib/modelwatch/data/watch-snapshot.json");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const reportPath = args.includes("--report")
  ? args[args.indexOf("--report") + 1]
  : null;
const NOTIFY = args.includes("--notify");

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Writes only when the content actually differs, ignoring the generatedAt
 * timestamp. This is what makes "nothing changed upstream" produce a genuinely
 * empty git diff rather than a timestamp-only commit every week.
 */
function writeIfChanged(path: string, next: string): boolean {
  let existing = "";
  try {
    existing = readFileSync(path, "utf-8");
  } catch {
    existing = "";
  }
  if (stripVolatile(existing) === stripVolatile(next)) return false;
  writeFileSync(path, next);
  return true;
}

function stripVolatile(s: string): string {
  return s.replace(/"generatedAt":\s*"[^"]*"/g, '"generatedAt":""');
}

function describe(proposal: Proposal): string {
  const tier = proposal.tier ? `${proposal.tier}GB` : "no tier";
  return [
    `  [${proposal.risk}] ${tier}: ${proposal.candidate.ollamaName} ` +
      `(${proposal.candidate.residentGB}GB, needs ${proposal.candidate.ramRequiredGB}GB RAM)`,
    ...proposal.reasons.map((r) => `      - ${r}`),
  ].join("\n");
}

function summarize(report: WatchReport): string {
  const actionable = report.proposals.filter((p) => p.risk !== "blocked");
  if (actionable.length === 0) return "no changes";
  return actionable
    .map((p) => `${p.tier}GB -> ${p.candidate.ollamaName}`)
    .join(", ");
}

async function main() {
  console.log(`[modelwatch] starting${APPLY ? " (--apply)" : " (report only)"}`);

  const { report, judgements, candidates } = await runWatch(curatedModels);

  console.log(
    `[modelwatch] library=${report.librarySize} candidates=${report.candidateCount} ` +
      `status=${report.status} risk=${report.risk}`
  );

  if (report.tierGaps.length > 0) {
    console.log(
      `[modelwatch] roster gap: ${report.tierGaps.join("GB, ")}GB ` +
        `share a pick with a lower tier — no better model found that fits`
    );
  }

  for (const proposal of report.proposals) console.log(describe(proposal));

  if (reportPath) {
    writeFileSync(
      reportPath,
      `${JSON.stringify(
        { ...report, summary: summarize(report), message: formatWatchMessage(report, APPLY) },
        null,
        2
      )}\n`
    );
    console.log(`[modelwatch] report written to ${reportPath}`);
  }

  if (NOTIFY) await notify(formatWatchMessage(report, APPLY));

  if (report.status === "degraded") {
    console.error("[modelwatch] degraded run — writing nothing:");
    for (const reason of report.degradedReasons) console.error(`  - ${reason}`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log("[modelwatch] report only; re-run with --apply to write");
    return;
  }

  const accepted = report.proposals.filter((p) => p.risk !== "blocked");
  const judgementFor = (name: string) =>
    judgements.find((j) => j.ollamaName === name) ?? null;

  const nextRoster = applyProposals(curatedModels, accepted, judgementFor, today());
  const curatedChanged = writeIfChanged(CURATED_PATH, serializeCurated(nextRoster));

  // Pass every candidate, not just the ones that became proposals: the
  // snapshot's value is showing what was considered and why it lost.
  const snapshot = toSnapshot(report, nextRoster, candidates);
  const snapshotChanged = writeIfChanged(
    SNAPSHOT_PATH,
    `${JSON.stringify(snapshot, null, 2)}\n`
  );

  console.log(
    `[modelwatch] curated.json ${curatedChanged ? "updated" : "unchanged"}, ` +
      `snapshot ${snapshotChanged ? "updated" : "unchanged"}`
  );
}

/**
 * Posts to the admin chat, not the public @localainews channel — an ops ping
 * about a roster change isn't news for readers. Failing to notify must never
 * fail the run, so this only warns.
 */
async function notify(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[modelwatch] TELEGRAM_BOT_TOKEN/TELEGRAM_ADMIN_CHAT_ID unset — not notifying");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    console.log(`[modelwatch] telegram ${res.ok ? "sent" : `failed (${res.status})`}`);
  } catch (err) {
    console.warn("[modelwatch] telegram notify failed:", err);
  }
}

main().catch((err) => {
  console.error("[modelwatch] failed:", err);
  process.exit(1);
});
