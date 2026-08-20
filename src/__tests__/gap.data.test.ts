import { epochFindings } from "@/lib/gap/epochFindings";
import historyFile from "@/lib/gap/data/history.json";
import type { GapHistoryFile } from "@/lib/gap/types";

describe("epochFindings", () => {
  it("is sorted ascending by asOf", () => {
    const dates = epochFindings.map((f) => f.asOf);
    expect(dates).toEqual([...dates].sort());
  });

  it("every entry has a source citation", () => {
    for (const f of epochFindings) {
      expect(f.sourceUrl).toMatch(/^https:\/\//);
      expect(f.sourceLabel.length).toBeGreaterThan(0);
    }
  });
});

describe("gap history data file", () => {
  const history = historyFile as GapHistoryFile;

  it("is sorted ascending by date with no duplicates", () => {
    const dates = history.points.map((p) => p.date);
    expect(dates).toEqual([...dates].sort());
    expect(new Set(dates).size).toBe(dates.length);
  });

  it("every point has a source citation", () => {
    for (const p of history.points) {
      expect(p.sourceUrl).toMatch(/^https:\/\//);
      expect(p.sourceLabel.length).toBeGreaterThan(0);
    }
  });
});
