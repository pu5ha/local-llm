"use client";

import { motion } from "framer-motion";
import { Clock, TrendingDown, ExternalLink } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import type { GapData } from "@/lib/gap/types";
import TrendChart from "./TrendChart";

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
  const { current, meta, epochFindings, history } = data;
  const latestEpoch = epochFindings[epochFindings.length - 1];

  const aaChartPoints = history.map((h) => ({
    date: formatMonthDate(h.date),
    value: h.date,
    y: h.gapPoints,
    sourceUrl: h.sourceUrl,
    sourceLabel: h.sourceLabel,
    tooltip: `${formatMonthDate(h.date)}: ${h.gapPoints}pt gap (${h.openLeader} vs ${h.closedLeader}) — ${h.sourceLabel}`,
  }));

  const epochChartPoints = epochFindings.map((f) => ({
    date: formatMonthDate(f.asOf),
    value: f.asOf,
    y: f.monthsBehind,
    sourceUrl: f.sourceUrl,
    sourceLabel: f.sourceLabel,
    tooltip: `${formatMonthDate(f.asOf)}: ${f.monthsBehind} months behind — ${f.sourceLabel}`,
  }));

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">
            Open <span className="text-primary">vs</span> Closed
          </h1>
          <p className="text-muted max-w-2xl mx-auto mb-4">
            How far behind open-source models really are on benchmarks — and
            how fast that gap is closing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
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

        {/* Stat callouts */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Card>
            <p className="text-sm text-muted mb-2">Current gap (Intelligence Index)</p>
            <p className="font-serif text-5xl mb-3">
              {current.gapPoints >= 0 ? current.gapPoints : Math.abs(current.gapPoints)}
              <span className="text-xl text-muted"> pts</span>
              {current.gapPoints < 0 && (
                <span className="block text-base text-primary mt-1">Open models are ahead</span>
              )}
            </p>
            <p className="text-sm text-muted mb-1">
              Leading open: <strong className="text-foreground">{current.openLeader.name}</strong>{" "}
              ({current.openLeader.intelligenceIndex})
            </p>
            <p className="text-sm text-muted mb-4">
              Leading closed:{" "}
              <strong className="text-foreground">{current.closedLeader.name}</strong> (
              {current.closedLeader.intelligenceIndex})
            </p>
            <a
              href="https://artificialanalysis.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
            >
              Source: Artificial Analysis <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Card>

          <Card>
            <p className="text-sm text-muted mb-2">Epoch AI: months behind frontier</p>
            <p className="font-serif text-5xl mb-3">
              {latestEpoch.monthsBehind}
              <span className="text-xl text-muted"> months</span>
            </p>
            {latestEpoch.confidenceNote && (
              <p className="text-sm text-muted mb-1">{latestEpoch.confidenceNote}</p>
            )}
            <p className="text-sm text-muted mb-4">As of {formatCalendarDate(latestEpoch.asOf)}</p>
            <a
              href={latestEpoch.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
            >
              Source: Epoch AI <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Card>
        </div>

        {/* Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl">The gap is closing</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card hover={false}>
              <p className="text-sm font-medium mb-1">Intelligence Index gap, over time</p>
              <p className="text-xs text-muted mb-4">Leading open model vs. leading closed model</p>
              <TrendChart points={aaChartPoints} unitLabel="pt" />
            </Card>
            <Card hover={false}>
              <p className="text-sm font-medium mb-1">Months behind frontier, over time</p>
              <p className="text-xs text-muted mb-4">Epoch AI Capabilities Index research</p>
              <TrendChart points={epochChartPoints} unitLabel="mo" color="var(--secondary)" />
            </Card>
          </div>
          <p className="text-xs text-muted mt-3">
            Each point links to its cited source. Points marked from before this
            site started tracking live data are hand-cited historical
            checkpoints, not automatically recomputed.
          </p>
        </motion.div>

        {/* Methodology & sources */}
        <Card className="text-sm text-muted space-y-3" hover={false}>
          <p>
            <strong className="text-foreground">How &ldquo;open&rdquo; vs &ldquo;closed&rdquo; is decided:</strong>{" "}
            models are classified by creator (Meta, Mistral, Alibaba/Qwen,
            DeepSeek, Moonshot, and similar labs count as open; OpenAI,
            Anthropic, Google, Microsoft, xAI, and Amazon count as closed by
            default), with per-model overrides for creators that ship both
            (e.g. Google&apos;s Gemma is open, Gemini is closed). This is a
            hand-maintained list, reviewed periodically — the same approach
            this site uses to curate its recommended local models.
          </p>
          <p>
            <strong className="text-foreground">Not to be confused with:</strong>{" "}
            Artificial Analysis also publishes a separate &quot;Openness
            Index&quot; that scores license/transparency rather than
            benchmark performance. The numbers on this page are about
            capability, not licensing.
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
              href="https://epoch.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Epoch AI
            </a>
            . <Badge variant="default">Refreshed automatically</Badge>
          </p>
        </Card>
      </div>
    </div>
  );
}
