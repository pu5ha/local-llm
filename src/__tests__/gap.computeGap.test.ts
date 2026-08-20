import { computeCurrentGap, buildLeaderboard } from "@/lib/gap/computeGap";
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

describe("buildLeaderboard", () => {
  it("sorts descending by intelligenceIndex, mixing open and closed", () => {
    const models = [
      model({ slug: "a", openness: "open", intelligenceIndex: 40 }),
      model({ slug: "b", openness: "closed", intelligenceIndex: 60 }),
      model({ slug: "c", openness: "open", intelligenceIndex: 55 }),
    ];
    const board = buildLeaderboard(models);
    expect(board.map((m) => m.slug)).toEqual(["b", "c", "a"]);
  });

  it("respects the limit", () => {
    const models = Array.from({ length: 20 }, (_, i) =>
      model({ slug: `m${i}`, intelligenceIndex: i })
    );
    expect(buildLeaderboard(models, 5)).toHaveLength(5);
    expect(buildLeaderboard(models)).toHaveLength(15);
  });

  it("does not mutate the input array", () => {
    const models = [
      model({ slug: "a", intelligenceIndex: 10 }),
      model({ slug: "b", intelligenceIndex: 20 }),
    ];
    buildLeaderboard(models);
    expect(models.map((m) => m.slug)).toEqual(["a", "b"]);
  });
});
