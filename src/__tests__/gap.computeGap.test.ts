import { computeCurrentGap } from "@/lib/gap/computeGap";
import type { ClassifiedModel } from "@/lib/gap/types";

function model(overrides: Partial<ClassifiedModel>): ClassifiedModel {
  return {
    slug: "m",
    name: "Model",
    creatorSlug: "org",
    creatorName: "Org",
    intelligenceIndex: 50,
    openness: "open",
    ...overrides,
  };
}

describe("computeCurrentGap", () => {
  it("picks the highest-scoring model on each side", () => {
    const models = [
      model({ slug: "a", name: "A", openness: "open", intelligenceIndex: 40 }),
      model({ slug: "b", name: "B", openness: "open", intelligenceIndex: 55 }),
      model({ slug: "c", name: "C", openness: "closed", intelligenceIndex: 60 }),
      model({ slug: "d", name: "D", openness: "closed", intelligenceIndex: 58 }),
    ];
    const gap = computeCurrentGap(models);
    expect(gap?.openLeader.slug).toBe("b");
    expect(gap?.closedLeader.slug).toBe("c");
    expect(gap?.gapPoints).toBe(5);
  });

  it("returns null when there are no open models", () => {
    const models = [model({ slug: "c", openness: "closed", intelligenceIndex: 60 })];
    expect(computeCurrentGap(models)).toBeNull();
  });

  it("returns null when there are no closed models", () => {
    const models = [model({ slug: "a", openness: "open", intelligenceIndex: 60 })];
    expect(computeCurrentGap(models)).toBeNull();
  });

  it("does not clamp a negative gap when an open model leads", () => {
    const models = [
      model({ slug: "a", openness: "open", intelligenceIndex: 70 }),
      model({ slug: "c", openness: "closed", intelligenceIndex: 60 }),
    ];
    expect(computeCurrentGap(models)?.gapPoints).toBe(-10);
  });
});
