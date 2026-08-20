"use client";

interface TrendPoint {
  date: string; // pre-formatted axis date label, e.g. "Apr 2025"
  y: number;
  sourceUrl: string;
  sourceLabel: string;
  tooltip: string; // full accessible description, e.g. "Apr 2025: 13pt gap — cited from ..."
}

/**
 * A single-series line chart, sized to be the page's main "story" visual —
 * not a small side-by-side sparkline. No legend (one series needs none —
 * the heading above it names what's plotted). Hover/focus reveals a native
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

  const width = 900;
  const height = 340;
  const padLeft = 36;
  const padRight = 56;
  const padTop = 32;
  const padBottom = 40;

  const values = points.map((p) => p.y);
  const minY = Math.min(0, ...values);

  // Round the top gridline to a "nice" step (1/2/5/10 x 10^n) instead of a
  // raw quartile split, so axis labels read 0/5/10/15 rather than 0/4/7/11.
  const rawMax = Math.max(...values, 1);
  const roughStep = (rawMax - minY) / 4;
  const exponent = Math.floor(Math.log10(roughStep || 1));
  const fraction = roughStep / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const step = niceFraction * 10 ** exponent;
  const maxY = Math.ceil((rawMax - minY) / step) * step + minY || step;
  const spanY = maxY - minY || 1;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const xFor = (i: number) =>
    points.length === 1 ? padLeft + plotWidth / 2 : padLeft + (i / (points.length - 1)) * plotWidth;
  const yFor = (v: number) => padTop + plotHeight - ((v - minY) / spanY) * plotHeight;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.y).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${xFor(0).toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

  const last = points[points.length - 1];

  // Gridlines at exact multiples of `step`, so labels are clean (0/5/10/15),
  // not an arbitrary 4-way split of the span.
  const numSteps = Math.round(spanY / step);
  const gridValues = Array.from({ length: numSteps + 1 }, (_, i) => minY + i * step);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[480px]"
        style={{ fontFamily: "var(--font-mono)" }}
        role="img"
        aria-label={`${unitLabel} trend from ${points[0].date} to ${last.date}`}
      >
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={padLeft - 10} y={yFor(v) + 4} textAnchor="end" fontSize={12} fill="var(--muted)">
              {Math.round(v)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={color} opacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <a key={p.date + i} href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
            <circle cx={xFor(i)} cy={yFor(p.y)} r={6} fill={color} stroke="var(--card)" strokeWidth={2}>
              <title>{p.tooltip}</title>
            </circle>
          </a>
        ))}

        {/* endpoint value label */}
        <text
          x={xFor(points.length - 1) + 10}
          y={yFor(last.y) + 5}
          textAnchor="start"
          fontSize={16}
          fontWeight={700}
          fill="var(--foreground)"
        >
          {last.y}
          {unitLabel}
        </text>

        {/* x-axis date labels for every point */}
        {points.map((p, i) => (
          <text
            key={p.date + i}
            x={xFor(i)}
            y={height - padBottom + 22}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            fontSize={12}
            fill="var(--muted)"
          >
            {p.date}
          </text>
        ))}
      </svg>
    </div>
  );
}
