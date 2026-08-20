"use client";

import { Badge } from "@/components/ui";
import type { ClassifiedModel } from "@/lib/gap/types";

/**
 * Ranked list mixing open + closed models by score. Bar length is the
 * primary read (magnitude), color marks open vs. closed (never color
 * alone — every row also carries a text badge), and the score is always
 * labeled just past the bar's end so it never clips at any bar length.
 */
export default function Leaderboard({ models }: { models: ClassifiedModel[] }) {
  if (models.length === 0) return null;

  const maxScore = Math.max(...models.map((m) => m.intelligenceIndex));

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />
          Open source
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--muted)" }} />
          Closed
        </span>
      </div>

      <ol className="space-y-1">
        {models.map((m, i) => {
          const rank = i + 1;
          const widthPct = Math.max((m.intelligenceIndex / maxScore) * 100, 4);
          const isOpen = m.openness === "open";
          return (
            <li
              key={m.slug}
              className="grid items-center gap-3 py-2 rounded-lg px-2 -mx-2 transition-colors hover:bg-background-alt"
              style={{ gridTemplateColumns: "2rem minmax(0,1.6fr) minmax(0,1fr) 3rem" }}
            >
              <span
                className={`text-sm font-mono tabular-nums text-right ${
                  isOpen ? "text-primary font-semibold" : "text-muted"
                }`}
              >
                {rank}
              </span>

              <span className="min-w-0 flex items-center gap-2">
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate">{m.name}</span>
                  <span className="block text-xs text-muted truncate">{m.creatorName}</span>
                </span>
                <Badge variant={isOpen ? "success" : "default"} className="shrink-0">
                  {isOpen ? "Open" : "Closed"}
                </Badge>
              </span>

              <span className="h-6 flex items-center">
                <span
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${widthPct}%`,
                    background: isOpen ? "var(--primary)" : "var(--muted)",
                    minWidth: "8px",
                  }}
                />
              </span>

              <span className="text-sm font-semibold font-mono tabular-nums text-right">
                {m.intelligenceIndex}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
