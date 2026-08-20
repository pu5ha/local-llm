import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog/getCatalog";
import RefreshButton from "./RefreshButton";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey || key !== adminKey) {
    notFound();
  }

  const catalog = await getCatalog();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif mb-2">Catalog review</h1>
      <p className="text-sm text-muted mb-6">
        Data source: <strong>{catalog.meta.source}</strong> (fetched{" "}
        {catalog.meta.fetchedAt})
      </p>
      {catalog.meta.warning && (
        <p role="alert" className="tag tag-amber mb-6 inline-block">
          {catalog.meta.warning}
        </p>
      )}

      <div className="mb-8">
        <RefreshButton adminKey={adminKey} />
      </div>

      <h2 className="text-xl font-semibold mb-3">
        New / uncurated models ({catalog.uncurated.length})
      </h2>
      <p className="text-sm text-muted mb-4">
        Trending in the live source but not yet reviewed — never shown to
        visitors or eligible for recommendation until added to{" "}
        <code>src/lib/catalog/curated.ts</code>.
      </p>
      <ul className="mb-10 space-y-2">
        {catalog.uncurated.map((m) => (
          <li key={m.hfModelId} className="paper-card p-3 text-sm">
            <strong>{m.name}</strong> ({m.hfModelId}) —{" "}
            {m.downloads?.toLocaleString() ?? "?"} downloads,{" "}
            {m.likes?.toLocaleString() ?? "?"} likes — first seen{" "}
            {m.firstSeenAt}
          </li>
        ))}
        {catalog.uncurated.length === 0 && (
          <li className="text-sm text-muted">Nothing uncurated right now.</li>
        )}
      </ul>

      <h2 className="text-xl font-semibold mb-3">
        Currently curated models ({catalog.models.length})
      </h2>
      <ul className="space-y-2">
        {catalog.models.map((m) => (
          <li key={m.id} className="paper-card p-3 text-sm">
            {m.name} {m.featured ? "★ featured" : ""} — {m.parameters}, needs{" "}
            {m.ramRequired} RAM — facts: {m.factsSource}
          </li>
        ))}
      </ul>
    </div>
  );
}
