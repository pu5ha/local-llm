import { notFound } from "next/navigation";
import { getGapData } from "@/lib/gap/getGapData";
import RefreshButton from "../catalog/RefreshButton";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminGapPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey || key !== adminKey) {
    notFound();
  }

  const data = await getGapData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif mb-2">Open vs Closed: gap review</h1>
      <p className="text-sm text-muted mb-6">
        Data source: <strong>{data.meta.source}</strong> (fetched{" "}
        {data.meta.fetchedAt})
      </p>
      {data.meta.warning && (
        <p role="alert" className="tag tag-amber mb-6 inline-block">
          {data.meta.warning}
        </p>
      )}

      <div className="mb-8">
        <RefreshButton adminKey={adminKey} endpoint="/api/gap" />
      </div>

      <h2 className="text-xl font-semibold mb-3">Current gap</h2>
      <p className="text-sm mb-10">
        {data.current.openLeader.name} ({data.current.openLeader.intelligenceIndex}) vs.{" "}
        {data.current.closedLeader.name} ({data.current.closedLeader.intelligenceIndex}) ={" "}
        <strong>{data.current.gapPoints} pt gap</strong>
      </p>

      <h2 className="text-xl font-semibold mb-3">
        Needs classification ({data.unclassified.length})
      </h2>
      <p className="text-sm text-muted mb-4">
        Models from the live source with a creator not yet in{" "}
        <code>src/lib/gap/classification.ts</code> — excluded from the gap
        calculation until classified.
      </p>
      <ul className="mb-10 space-y-2">
        {data.unclassified.map((m) => (
          <li key={m.slug} className="paper-card p-3 text-sm">
            <strong>{m.modelName}</strong> — {m.creatorName} ({m.creatorSlug})
          </li>
        ))}
        {data.unclassified.length === 0 && (
          <li className="text-sm text-muted">Nothing unclassified right now.</li>
        )}
      </ul>

      <h2 className="text-xl font-semibold mb-3">Epoch AI findings log</h2>
      <ul className="mb-10 space-y-2">
        {data.epochFindings.map((f) => (
          <li key={f.asOf} className="paper-card p-3 text-sm">
            {f.asOf} — {f.monthsBehind} months behind
            {f.eciPoints !== undefined ? ` (${f.eciPoints} ECI pts)` : ""} —{" "}
            <a href={f.sourceUrl} className="text-primary hover:underline">
              {f.sourceLabel}
            </a>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3">
        Intelligence Index history ({data.history.length})
      </h2>
      <ul className="space-y-2">
        {data.history.map((h) => (
          <li key={h.date} className="paper-card p-3 text-sm">
            {h.date} — {h.gapPoints}pt gap ({h.openLeader} vs {h.closedLeader})
            {h.seeded ? " — seeded" : " — auto-recorded"} —{" "}
            <a href={h.sourceUrl} className="text-primary hover:underline">
              {h.sourceLabel}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
