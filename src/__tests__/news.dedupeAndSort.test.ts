import { dedupeAndSort, capAndFilterRecent, canonicalizeUrl } from "@/lib/news/dedupeAndSort";
import type { NewsItem } from "@/lib/news/types";

function makeItem(overrides: Partial<NewsItem>): NewsItem {
  return {
    title: "Title",
    url: "https://example.com/post",
    source: "Test",
    sourceKind: "rss",
    category: "general",
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("canonicalizeUrl", () => {
  it("strips utm params, trailing slash, and www", () => {
    expect(canonicalizeUrl("https://www.example.com/post/?utm_source=x&utm_medium=y")).toBe(
      canonicalizeUrl("https://example.com/post")
    );
  });

  it("strips hash fragments", () => {
    expect(canonicalizeUrl("https://example.com/post#section")).toBe(
      canonicalizeUrl("https://example.com/post")
    );
  });
});

describe("dedupeAndSort", () => {
  it("collapses items whose URLs differ only by tracking params/slash/www, keeping the first occurrence", () => {
    const items = [
      makeItem({ url: "https://example.com/post", title: "First seen", publishedAt: "2026-01-01T00:00:00.000Z" }),
      makeItem({ url: "https://www.example.com/post/?utm_source=x", title: "Duplicate", publishedAt: "2026-01-02T00:00:00.000Z" }),
    ];
    const result = dedupeAndSort(items);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("First seen");
  });

  it("sorts strictly by publishedAt descending", () => {
    const items = [
      makeItem({ url: "https://example.com/a", publishedAt: "2026-01-01T00:00:00.000Z" }),
      makeItem({ url: "https://example.com/b", publishedAt: "2026-01-03T00:00:00.000Z" }),
      makeItem({ url: "https://example.com/c", publishedAt: "2026-01-02T00:00:00.000Z" }),
    ];
    const result = dedupeAndSort(items);
    expect(result.map((i) => i.url)).toEqual([
      "https://example.com/b",
      "https://example.com/c",
      "https://example.com/a",
    ]);
  });

  it("does not enforce any age cutoff on its own", () => {
    const veryOld = makeItem({ url: "https://example.com/old", publishedAt: "2000-01-01T00:00:00.000Z" });
    const result = dedupeAndSort([veryOld]);
    expect(result).toHaveLength(1);
  });
});

describe("capAndFilterRecent", () => {
  const now = new Date("2026-01-31T00:00:00.000Z");

  it("drops items older than maxAgeDays relative to now", () => {
    const items = [
      makeItem({ url: "https://example.com/recent", publishedAt: "2026-01-30T00:00:00.000Z" }),
      makeItem({ url: "https://example.com/old", publishedAt: "2025-11-01T00:00:00.000Z" }),
    ];
    const result = capAndFilterRecent(items, now, 30, 100);
    expect(result.map((i) => i.url)).toEqual(["https://example.com/recent"]);
  });

  it("truncates to maxItems", () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({ url: `https://example.com/${i}`, publishedAt: "2026-01-30T00:00:00.000Z" })
    );
    const result = capAndFilterRecent(items, now, 30, 3);
    expect(result).toHaveLength(3);
  });
});
