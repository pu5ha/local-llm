import { getRecommendedModel, getRamCapabilityFlags } from "@/lib/catalog/recommend";
import { lookupVramGB, getAppleSiliconSuggestion } from "@/lib/catalog/hardwareTables";
import type { Model } from "@/lib/catalog/types";

function makeModel(overrides: Partial<Model>): Model {
  return {
    id: "id",
    ollamaName: "name",
    hfModelId: "org/name",
    name: "Name",
    provider: "Test",
    description: "desc",
    bestFor: [],
    quality: "great",
    speed: "fast",
    curatedAt: "2026-01-01",
    parameters: "8B",
    parametersB: 8,
    ramRequiredGB: 5,
    ramRequired: "5GB",
    factsSource: "live",
    ...overrides,
  };
}

describe("getRecommendedModel", () => {
  const catalog: Model[] = [
    makeModel({ id: "small", featured: true, ramRequiredGB: 3, parametersB: 4 }),
    makeModel({ id: "mid", featured: true, ramRequiredGB: 5, parametersB: 8 }),
    makeModel({ id: "big", featured: true, ramRequiredGB: 20, parametersB: 32 }),
    makeModel({ id: "unfeatured-fits", featured: false, ramRequiredGB: 3, parametersB: 4 }),
  ];

  it("only ever recommends featured models", () => {
    const result = getRecommendedModel(catalog, { ramGB: 64 });
    expect(result.primary?.id).not.toBe("unfeatured-fits");
    expect([result.primary, ...result.alternatives].every((m) => m?.featured)).toBe(true);
  });

  it("picks the biggest model that fits", () => {
    const result = getRecommendedModel(catalog, { ramGB: 16 });
    expect(result.primary?.id).toBe("mid");
  });

  it("recommends purely off RAM, with no GPU-based boost", () => {
    // usable = ramGB - OS_OVERHEAD_GB(4) = 16; below big's 20GB requirement either way
    const result = getRecommendedModel(catalog, { ramGB: 20 });
    expect(result.primary?.id).toBe("mid");
  });

  it("reserves OS/app overhead so a mid-size model doesn't get recommended at every tier", () => {
    // Entry tier scenario: 8GB total RAM should NOT recommend a model sized for Standard/Power
    const result = getRecommendedModel(catalog, { ramGB: 8 });
    expect(result.primary?.id).toBe("small");
  });

  it("returns null primary when nothing fits", () => {
    const result = getRecommendedModel(catalog, { ramGB: 1 });
    expect(result.primary).toBeNull();
    expect(result.maxParametersB).toBe(0);
  });
});

describe("getRamCapabilityFlags", () => {
  it("thresholds correctly", () => {
    expect(getRamCapabilityFlags(2)).toEqual({ canRun4GB: false, canRun8GB: false, canRun16GB: false });
    expect(getRamCapabilityFlags(16)).toEqual({ canRun4GB: true, canRun8GB: true, canRun16GB: true });
  });
});

describe("hardwareTables", () => {
  it("looks up current-gen NVIDIA GPUs", () => {
    expect(lookupVramGB("nvidia geforce rtx 5090")).toBe(32);
    expect(lookupVramGB("nvidia geforce rtx 4060")).toBe(8);
    expect(lookupVramGB("some unknown gpu")).toBeNull();
  });

  it("suggests RAM for Apple Silicon by chip family and core count", () => {
    expect(getAppleSiliconSuggestion("apple m5 max", 16).suggestedRamGB).toBe(36);
    expect(getAppleSiliconSuggestion("apple m4", 10).suggestedRamGB).toBe(16);
    expect(getAppleSiliconSuggestion("apple m9 (future chip)", 16).suggestedRamGB).toBe(32);
  });
});
