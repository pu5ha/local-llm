import type { WatchReport } from "./types";

/**
 * Telegram HTML summary of a run.
 *
 * Deliberately not `server-only`, so scripts/refresh-modelwatch.ts and the
 * workflow can import it directly rather than duplicating the wording — the
 * mistake src/lib/news/sources/* forced on refresh-news-snapshot.ts.
 */
export function formatWatchMessage(report: WatchReport, applied: boolean): string {
  const lines: string[] = [];

  if (report.status === "degraded") {
    lines.push("<b>Model watch: could not read upstream</b>");
    lines.push("Nothing was changed. Reasons:");
    for (const reason of report.degradedReasons) lines.push(`• ${escapeHtml(reason)}`);
    return lines.join("\n");
  }

  const actionable = report.proposals.filter((p) => p.risk !== "blocked");

  if (actionable.length === 0) {
    lines.push("<b>Model watch: no change</b>");
    lines.push(
      `Checked ${report.librarySize} models, ${report.candidateCount} could run locally. ` +
        "Current recommendations are still the best available."
    );
  } else {
    lines.push(
      applied
        ? "<b>Model watch: recommendations updated</b>"
        : "<b>Model watch: a change needs your review</b>"
    );
    for (const p of actionable) {
      lines.push(
        `\n<b>${p.tier}GB → <code>${escapeHtml(p.candidate.ollamaName)}</code></b> ` +
          `(${p.candidate.residentGB}GB download, needs ${p.candidate.ramRequiredGB}GB RAM)`
      );
      for (const reason of p.reasons) lines.push(`• ${escapeHtml(reason)}`);
    }
  }

  const blocked = report.proposals.filter((p) => p.risk === "blocked");
  if (blocked.length > 0) {
    lines.push(
      `\n${blocked.length} candidate${blocked.length === 1 ? "" : "s"} rejected as a downgrade.`
    );
  }

  if (report.tierGaps.length > 0) {
    lines.push(
      `\nRoster gap: ${report.tierGaps.join("GB, ")}GB has no better model than the tier below.`
    );
  }

  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
