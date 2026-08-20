import { mergeCatalog, estimateRamForParams } from "@/lib/catalog/mergeCatalog";
import type { CuratedModel, ModelFacts } from "@/lib/catalog/types";

const curated: CuratedModel[] = [
  {
    id: "a",
    ollamaName: "model-a",
    hfModelId: "org/model-a",
    name: "Model A",
    provider: "Test",
    description: "desc",
    bestFor: ["Chat"],
    quality: "great",
    speed: "fast",
    featured: true,
    curatedAt: "2026-01-01",
    parametersB: 8,
  },
  {
    id: "b",
    ollamaName: "model-b",
    hfModelId: "org/model-b",
    name: "Model B",
    provider: "Test",
    description: "desc",
    bestFor: ["Chat"],
    quality: "good",
    speed: "fast",
    curatedAt: "2026-01-01",
    parametersB: 4,
  },
];

const facts: ModelFacts[] = [
  { hfModelId: "org/model-a", downloads: 100, likes: 10 },
  { hfModelId: "org/model-c", downloads: 999, likes: 1 },
];

describe("estimateRamForParams", () => {
  it("applies the Q4 formula with overhead", () => {
    expect(estimateRamForParams(8)).toBe(Math.ceil(8 * 0.5 * 1.25));
  });
});

describe("mergeCatalog", () => {
  it("enriches curated models with matching live facts", () => {
    const catalog = mergeCatalog(curated, facts, "live");
    const a = catalog.models.find((m) => m.id === "a");
    expect(a?.factsSource).toBe("live");
    expect(a?.ramRequiredGB).toBe(estimateRamForParams(8));
    expect(a?.downloads).toBe(100);
  });

  it("still derives ramRequiredGB/parameters from curated parametersB when a curated model has no live facts", () => {
    const catalog = mergeCatalog(curated, facts, "live");
    const b = catalog.models.find((m) => m.id === "b");
    expect(b?.factsSource).toBe("missing");
    expect(b?.ramRequiredGB).toBe(estimateRamForParams(4));
    expect(b?.downloads).toBeUndefined();
  });

  it("puts facts with no curated match into uncurated, never into models", () => {
    const catalog = mergeCatalog(curated, facts, "live");
    expect(catalog.models.find((m) => m.hfModelId === "org/model-c")).toBeUndefined();
    expect(catalog.uncurated).toHaveLength(1);
    expect(catalog.uncurated[0].hfModelId).toBe("org/model-c");
  });

  it("carries forward firstSeenAt for previously-seen uncurated entries", () => {
    const previous = [
      { hfModelId: "org/model-c", downloads: 999, likes: 1, firstSeenAt: "2020-01-01T00:00:00.000Z" },
    ];
    const catalog = mergeCatalog(curated, facts, "live", previous);
    expect(catalog.uncurated[0].firstSeenAt).toBe("2020-01-01T00:00:00.000Z");
  });

  it("stamps meta.source correctly", () => {
    const catalog = mergeCatalog(curated, facts, "fallback-snapshot");
    expect(catalog.meta.source).toBe("fallback-snapshot");
  });
});
