import { selectNewItems } from "@/lib/telegram/notify";
import { canonicalizeUrl } from "@/lib/news/dedupeAndSort";
import type { NewsItem } from "@/lib/news/types";

jest.mock("@/lib/telegram/store", () => ({
  getSubscribers: jest.fn(),
  addSubscriber: jest.fn(),
  removeSubscriber: jest.fn(),
  getLastNotifiedUrl: jest.fn(),
  setLastNotifiedUrl: jest.fn(),
}));

jest.mock("@/lib/telegram/bot", () => ({
  getBot: jest.fn(),
}));

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

// Newest-first, matching the shape getNews() returns.
const FEED = [
  makeItem({ url: "https://example.com/d", title: "D", publishedAt: "2026-01-04T00:00:00.000Z" }),
  makeItem({ url: "https://example.com/c", title: "C", publishedAt: "2026-01-03T00:00:00.000Z" }),
  makeItem({ url: "https://example.com/b", title: "B", publishedAt: "2026-01-02T00:00:00.000Z" }),
  makeItem({ url: "https://example.com/a", title: "A", publishedAt: "2026-01-01T00:00:00.000Z" }),
];

describe("selectNewItems", () => {
  it("returns items newer than the cursor, oldest-first", () => {
    const result = selectNewItems(FEED, canonicalizeUrl("https://example.com/b"));
    expect(result.map((i) => i.title)).toEqual(["C", "D"]);
  });

  it("returns nothing when the cursor is the newest item", () => {
    const result = selectNewItems(FEED, canonicalizeUrl("https://example.com/d"));
    expect(result).toEqual([]);
  });

  it("caps and reverses to oldest-first on first run (no cursor)", () => {
    const result = selectNewItems(FEED, null);
    expect(result.map((i) => i.title)).toEqual(["A", "B", "C", "D"]);
  });

  it("falls back to the capped batch when the cursor is no longer in the feed", () => {
    const result = selectNewItems(FEED, canonicalizeUrl("https://example.com/stale-and-gone"));
    expect(result.map((i) => i.title)).toEqual(["A", "B", "C", "D"]);
  });

  it("matches the cursor regardless of tracking params, matching canonicalizeUrl semantics", () => {
    const result = selectNewItems(FEED, canonicalizeUrl("https://www.example.com/b/?utm_source=x"));
    expect(result.map((i) => i.title)).toEqual(["C", "D"]);
  });
});
