/**
 * Regenerates src/lib/catalog/data/fallback-snapshot.json from the live
 * Hugging Face Hub API. Run with `npm run catalog:snapshot` and commit the
 * diff whenever you want to update the last-known-good fallback data.
 */
import fs from "node:fs";
import path from "node:path";
import { curatedModels } from "../src/lib/catalog/curated";
import type { FallbackSnapshot, ModelFacts } from "../src/lib/catalog/types";

const HF_API_BASE = "https://huggingface.co/api/models";
const DISCOVERY_NOISE_PATTERN =
  /tiny-|trl-internal|-test|facebook\/opt-125m|gpt2$|distilgpt2/i;
const SNAPSHOT_PATH = path.join(
  __dirname,
  "../src/lib/catalog/data/fallback-snapshot.json"
);

interface HfApiModel {
  id: string;
  downloads?: number;
  likes?: number;
  lastModified?: string;
}

function toModelFacts(m: HfApiModel): ModelFacts {
  return {
    hfModelId: m.id,
    downloads: m.downloads,
    likes: m.likes,
    lastModified: m.lastModified,
  };
}

async function fetchOne(hfModelId: string): Promise<ModelFacts | null> {
  const res = await fetch(`${HF_API_BASE}/${hfModelId}`);
  if (!res.ok) return null;
  return toModelFacts((await res.json()) as HfApiModel);
}

async function fetchDiscoveryCandidates(): Promise<ModelFacts[]> {
  const res = await fetch(
    `${HF_API_BASE}?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=40`
  );
  if (!res.ok) return [];
  const json = (await res.json()) as HfApiModel[];
  if (!Array.isArray(json)) return [];
  return json
    .filter((m) => m.id && !DISCOVERY_NOISE_PATTERN.test(m.id))
    .map(toModelFacts);
}

async function main() {
  const curatedIds = curatedModels.map((m) => m.hfModelId);
  const [curatedResults, discoveryResults] = await Promise.all([
    Promise.all(curatedIds.map(fetchOne)),
    fetchDiscoveryCandidates(),
  ]);

  const curatedFacts = curatedResults.filter((f): f is ModelFacts => f !== null);
  const seen = new Set(curatedFacts.map((f) => f.hfModelId));
  const extraDiscovery = discoveryResults.filter((f) => !seen.has(f.hfModelId));
  const facts = [...curatedFacts, ...extraDiscovery];

  const previous: FallbackSnapshot = JSON.parse(
    fs.readFileSync(SNAPSHOT_PATH, "utf-8")
  );
  const previousFirstSeen = new Map(
    previous.uncurated.map((u) => [u.hfModelId, u.firstSeenAt])
  );
  const now = new Date().toISOString();

  const uncurated = extraDiscovery.map((f) => ({
    ...f,
    firstSeenAt: previousFirstSeen.get(f.hfModelId) ?? now,
  }));

  const snapshot: FallbackSnapshot = { generatedAt: now, facts, uncurated };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(
    `Wrote ${facts.length} facts (${uncurated.length} uncurated) to ${SNAPSHOT_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
