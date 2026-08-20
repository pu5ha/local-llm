import { formatRelativeTime } from "@/lib/news/formatRelativeTime";

describe("formatRelativeTime", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("formats minutes", () => {
    expect(formatRelativeTime("2026-01-01T11:55:00.000Z", now)).toBe("5m ago");
  });

  it("formats hours", () => {
    expect(formatRelativeTime("2026-01-01T09:00:00.000Z", now)).toBe("3h ago");
  });

  it("formats days", () => {
    expect(formatRelativeTime("2025-12-30T12:00:00.000Z", now)).toBe("2d ago");
  });
});
