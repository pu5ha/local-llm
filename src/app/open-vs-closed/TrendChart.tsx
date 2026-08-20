"use client";

interface TrendPoint {
  date: string;
  value: string; // pre-formatted axis date label, e.g. "Apr 2025"
  y: number;
  sourceUrl: string;
  sourceLabel: string;
  tooltip: string; // full accessible description, e.g. "Apr 2025: 13pt gap — cited from ..."
}

/**
 * A single-series line chart. No legend (one series needs none — the
 * heading above it names what's plotted). Hover/focus reveals a native
 * SVG tooltip via <title>, and each point links to its cited source.
 */
export default function TrendChart({
  points,
  unitLabel,
  color = "var(--primary)",
}: {
  points: TrendPoint[];
  unitLabel: string;
  color?: string;
}) {
  if (points.length === 0) return null;

  const width = 480;
  const height = 160;
  const padX = 16;
  const padTop = 24;
  const padBottom = 28;

  const values = points.map((p) => p.y);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(...values);
  const spanY = maxY - minY || 1;

  const plotWidth = width - padX * 2;
  const plotHeight = height - padTop - padBottom;

  const xFor = (i: number) =>
    points.length === 1 ? padX + plotWidth / 2 : padX + (i / (points.length - 1)) * plotWidth;
  const yFor = (v: number) => padTop + plotHeight - ((v - minY) / spanY) * plotHeight;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.y).toFixed(1)}`)
    .join(" ");

  const baselineY = yFor(0);
  const last = points[points.length - 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[320px]"
        role="img"
        aria-label={`${unitLabel} trend from ${points[0].date} to ${last.date}`}
      >
        {/* baseline */}
        <line
          x1={padX}
          x2={width - padX}
          y1={baselineY}
          y2={baselineY}
          stroke="var(--border)"
          strokeWidth={1}
        />

        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <a key={p.date} href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
            <circle
              cx={xFor(i)}
              cy={yFor(p.y)}
              r={5}
              fill={color}
              stroke="var(--card)"
              strokeWidth={2}
            >
              <title>{p.tooltip}</title>
            </circle>
          </a>
        ))}

        {/* endpoint value label */}
        <text
          x={xFor(points.length - 1)}
          y={yFor(last.y) - 12}
          textAnchor="end"
          fontSize={13}
          fontWeight={600}
          fill="var(--foreground)"
        >
          {last.y}
          {unitLabel}
        </text>

        {/* x-axis date labels: first and last only */}
        <text x={xFor(0)} y={height - 8} textAnchor="start" fontSize={11} fill="var(--muted)">
          {points[0].date}
        </text>
        <text x={xFor(points.length - 1)} y={height - 8} textAnchor="end" fontSize={11} fill="var(--muted)">
          {last.date}
        </text>
      </svg>
    </div>
  );
}
