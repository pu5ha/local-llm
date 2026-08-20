"use client";

import { motion } from "framer-motion";
import { Clock, ExternalLink } from "lucide-react";
import type { GapData } from "@/lib/gap/types";
import TrendChart from "./TrendChart";
import Leaderboard from "./Leaderboard";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** For a full ISO instant (e.g. meta.fetchedAt) — displayed in the viewer's local time. */
function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFormatter.format(d);
}

// Plain "YYYY-MM-DD" strings (asOf/date fields) parse as UTC midnight; format
// them back in UTC too, or a viewer west of UTC sees the previous day/month.
const calendarDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const calendarMonthFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatCalendarDate(isoDate: string) {
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? isoDate : calendarDateFormatter.format(d);
}

function formatMonthDate(isoDate: string) {
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? isoDate : calendarMonthFormatter.format(d);
}

export default function OpenVsClosedView({ data }: { data: GapData }) {
  const { current, meta, epochFindings, history, leaderboard } = data;
  const latestEpoch = epochFindings[epochFindings.length - 1];

  const chartPoints = history.map((h) => ({
    date: formatMonthDate(h.date),
    y: h.gapPoints,
    sourceUrl: h.sourceUrl,
    sourceLabel: h.sourceLabel,
    tooltip: `${formatMonthDate(h.date)}: ${h.gapPoints}pt gap (${h.openLeader} vs ${h.closedLeader}) — ${h.sourceLabel}`,
  }));

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl mb-2">
            Open <span className="text-primary">vs</span> Closed
          </h1>
          <p className="text-muted mb-3">
            Where open-source models rank against closed models on
            benchmarks — and how fast that gap is closing.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag tag-green inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last updated {formatDate(meta.fetchedAt)}
            </span>
            {meta.warning && (
              <span role="alert" className="tag tag-amber">
                {meta.warning}
              </span>
            )}
          </div>
        </motion.div>

        {/* Headline stat row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid sm:grid-cols-2 gap-3 mb-8"
        >
          <div className="paper-card p-4">
            <p className="text-xs text-muted mb-1">Current gap (Intelligence Index)</p>
            <p className="text-2xl font-semibold mb-1 font-mono">
              {current.gapPoints >= 0 ? current.gapPoints : Math.abs(current.gapPoints)}
              <span className="text-sm font-normal text-muted font-sans"> pts</span>
              {current.gapPoints < 0 && (
                <span className="ml-2 text-sm text-primary font-normal">Open is ahead</span>
              )}
            </p>
            <p className="text-xs text-muted">
              {current.openLeader.name} ({current.openLeader.intelligenceIndex}) vs.{" "}
              {current.closedLeader.name} ({current.closedLeader.intelligenceIndex})
            </p>
          </div>

          <div className="paper-card p-4">
            <p className="text-xs text-muted mb-1">Epoch AI: months behind frontier</p>
            <p className="text-2xl font-semibold mb-1 font-mono">
              {latestEpoch.monthsBehind}
              <span className="text-sm font-normal text-muted font-sans"> months</span>
            </p>
            <p className="text-xs text-muted">As of {formatCalendarDate(latestEpoch.asOf)}</p>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-serif text-2xl mb-1">Where models rank</h2>
          <p className="text-sm text-muted mb-4">
            Top {leaderboard.length} models by Artificial Analysis Intelligence
            Index, open and closed side by side.
          </p>
          <div className="paper-card p-4 sm:p-6">
            <Leaderboard models={leaderboard} />
          </div>
          <a
            href="https://artificialanalysis.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary inline-flex items-center gap-1 hover:underline mt-3"
          >
            Source: Artificial Analysis <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-serif text-2xl mb-1">The gap is closing</h2>
          <p className="text-sm text-muted mb-4">
            Leading open model vs. leading closed model, over time. Each
            point links to its cited source.
          </p>
          <div className="paper-card p-4 sm:p-6">
            <TrendChart points={chartPoints} unitLabel="pt" />
          </div>
        </motion.div>

        {/* Methodology & sources */}
        <div className="text-xs text-muted space-y-2 border-t border-border pt-6">
          <p>
            <strong className="text-foreground">How &ldquo;open&rdquo; vs &ldquo;closed&rdquo; is decided:</strong>{" "}
            models are classified by creator (Meta, Mistral, Alibaba/Qwen,
            DeepSeek, Moonshot, and similar labs count as open; OpenAI,
            Anthropic, Google, Microsoft, xAI, and Amazon count as closed by
            default), with per-model overrides for creators that ship both
            (e.g. Google&apos;s Gemma is open, Gemini is closed).
          </p>
          <p>
            Artificial Analysis also publishes a separate &ldquo;Openness
            Index&rdquo; scoring license/transparency rather than benchmark
            performance — the numbers on this page are about capability, not
            licensing.
          </p>
          <p>
            Data from{" "}
            <a
              href="https://artificialanalysis.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Artificial Analysis
            </a>{" "}
            and{" "}
            <a
              href={latestEpoch.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Epoch AI
            </a>
            , refreshed automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
