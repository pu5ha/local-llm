import { applyRewriteResults } from "@/lib/news/plainLanguage/applyRewriteResults";
import type { NewsItem } from "@/lib/news/types";
import type { RewriteResponse } from "@/lib/news/plainLanguage/schema";

function makeItem(overrides: Partial<NewsItem>): NewsItem {
  return {
    title: "Raw title",
    url: "https://example.com/a",
    summary: "Raw summary",
    source: "Test",
    sourceKind: "rss",
    category: "general",
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("applyRewriteResults", () => {
  it("returns items unchanged when response is null", () => {
    const items = [makeItem({})];
    expect(applyRewriteResults(items, null)).toEqual(items);
  });

  it("sets plainTitle/plainSummary for items matched by url with include: true", () => {
    const items = [makeItem({ url: "https://example.com/a" })];
    const response: RewriteResponse = {
      items: [
        {
          url: "https://example.com/a",
          plainTitle: "Plain title",
          plainSummary: "Plain summary",
          include: true,
        },
      ],
    };
    const result = applyRewriteResults(items, response);
    expect(result[0].plainTitle).toBe("Plain title");
    expect(result[0].plainSummary).toBe("Plain summary");
    expect(result[0].title).toBe("Raw title"); // raw fields untouched
  });

  it("leaves an item unrewritten when no matching url is returned", () => {
    const items = [
      makeItem({ url: "https://example.com/a" }),
      makeItem({ url: "https://example.com/b" }),
    ];
    const response: RewriteResponse = {
      items: [
        {
          url: "https://example.com/a",
          plainTitle: "Plain A",
          plainSummary: "Summary A",
          include: true,
        },
      ],
    };
    const result = applyRewriteResults(items, response);
    expect(result).toHaveLength(2);
    expect(result[0].plainTitle).toBe("Plain A");
    expect(result[1].plainTitle).toBeUndefined();
    expect(result[1].plainSummary).toBeUndefined();
  });

  it("drops an item entirely when the model returns include: false", () => {
    const items = [
      makeItem({ url: "https://example.com/a" }),
      makeItem({ url: "https://example.com/b" }),
    ];
    const response: RewriteResponse = {
      items: [
        {
          url: "https://example.com/a",
          plainTitle: "Not newsworthy",
          plainSummary: "Routine internal fix",
          include: false,
        },
        { url: "https://example.com/b", plainTitle: "Real news", plainSummary: "...", include: true },
      ],
    };
    const result = applyRewriteResults(items, response);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://example.com/b");
  });
});
