import { classifyAndReduce } from "@/lib/gap/fetchAaModels";
import type { AaModelRecord } from "@/lib/gap/types";

function record(overrides: Partial<AaModelRecord>): AaModelRecord {
  return {
    slug: "m",
    name: "Model",
    model_creator: { name: "Org", slug: "org" },
    artificial_analysis_intelligence_index: 50,
    ...overrides,
  };
}

describe("classifyAndReduce", () => {
  it("drops records with a missing intelligence index", () => {
    const { classified } = classifyAndReduce([
      record({ slug: "a", model_creator: { name: "Meta", slug: "meta" }, artificial_analysis_intelligence_index: null }),
    ]);
    expect(classified).toHaveLength(0);
  });

  it("reads the intelligence index from the nested evaluations field as a fallback", () => {
    const { classified } = classifyAndReduce([
      record({
        slug: "a",
        model_creator: { name: "Meta", slug: "meta" },
        artificial_analysis_intelligence_index: undefined,
        evaluations: { artificial_analysis_intelligence_index: 42 },
      }),
    ]);
    expect(classified[0]?.intelligenceIndex).toBe(42);
  });

  it("routes unrecognized creators into unclassified, not classified", () => {
    const { classified, unclassified } = classifyAndReduce([
      record({ slug: "a", model_creator: { name: "New Lab", slug: "new-lab" } }),
    ]);
    expect(classified).toHaveLength(0);
    expect(unclassified).toHaveLength(1);
    expect(unclassified[0].creatorSlug).toBe("new-lab");
  });

  it("classifies a recognized creator into classified", () => {
    const { classified, unclassified } = classifyAndReduce([
      record({ slug: "a", model_creator: { name: "Meta", slug: "meta" } }),
    ]);
    expect(classified).toHaveLength(1);
    expect(classified[0].openness).toBe("open");
    expect(unclassified).toHaveLength(0);
  });
});
