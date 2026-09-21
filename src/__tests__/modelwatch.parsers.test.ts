import { readFileSync } from "fs";
import { join } from "path";
import {
  parseLibraryHtml,
  parsePullCount,
  parseSizeTag,
  parseTagsHtml,
} from "@/lib/modelwatch/parseLibraryHtml";
import { parseManifest } from "@/lib/modelwatch/parseManifest";

const FIXTURES = join(__dirname, "../lib/modelwatch/__fixtures__");
const fixture = (name: string) => readFileSync(join(FIXTURES, name), "utf-8");
const json = (name: string) => JSON.parse(fixture(name));

describe("parsePullCount", () => {
  it("expands the K/M/B suffixes Ollama displays", () => {
    expect(parsePullCount("119.7M")).toBe(119_700_000);
    expect(parsePullCount("980K")).toBe(980_000);
    expect(parsePullCount("76K")).toBe(76_000);
    expect(parsePullCount("512")).toBe(512);
  });

  it("rejects junk rather than guessing", () => {
    expect(parsePullCount("")).toBeNull();
    expect(parsePullCount("lots")).toBeNull();
  });
});

describe("parseLibraryHtml", () => {
  const entries = parseLibraryHtml(fixture("library-popular-trimmed.html"));

  it("reads one entry per family off the real page markup", () => {
    expect(entries.length).toBeGreaterThanOrEqual(10);
    expect(new Set(entries.map((e) => e.family)).size).toBe(entries.length);
  });

  it("extracts pull counts and size badges", () => {
    // llama3.1 is the most-pulled model and leads the popular sort.
    const top = entries[0];
    expect(top.family).toBe("llama3.1");
    expect(top.pulls).toBeGreaterThan(50_000_000);
    expect(top.sizeBadges).toContain("8b");

    const gemma4 = entries.find((e) => e.family === "gemma4");
    expect(gemma4?.sizeBadges).toEqual(expect.arrayContaining(["12b", "26b", "31b"]));
  });

  it("never mistakes the pull count for a parameter badge", () => {
    for (const e of entries) {
      expect(e.sizeBadges).not.toContain("119.7b");
    }
  });

  it("returns nothing when the markup no longer matches", () => {
    // The guard that matters: a markup change must collapse the entry count so
    // MIN_LIBRARY_ENTRIES aborts the run, rather than yielding a few plausible
    // entries that get acted on as if they were the whole catalogue.
    expect(parseLibraryHtml("<div>totally different markup</div>")).toEqual([]);
    expect(parseLibraryHtml("")).toEqual([]);
  });
});

describe("parseTagsHtml", () => {
  it("lists a family's real tags", () => {
    const tags = parseTagsHtml("gemma4", fixture("tags-gemma4-trimmed.html"));
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toContain("12b");
  });
});

describe("parseSizeTag", () => {
  it("reads Mixture-of-Experts active parameters", () => {
    expect(parseSizeTag("35b-a3b")).toEqual({ parametersB: 35, activeParametersB: 3 });
    expect(parseSizeTag("30b-a3b-instruct-q4_K_M")).toEqual({
      parametersB: 30,
      activeParametersB: 3,
    });
  });

  it("reads dense tags with no active-param component", () => {
    expect(parseSizeTag("27b")).toEqual({ parametersB: 27 });
    expect(parseSizeTag("3.8b")).toEqual({ parametersB: 3.8 });
  });

  it("rejects tags that carry no size", () => {
    expect(parseSizeTag("latest")).toBeNull();
    expect(parseSizeTag("e4b")).toBeNull();
    expect(parseSizeTag("")).toBeNull();
  });
});

describe("parseManifest", () => {
  it("measures a vision model's weights and resident size separately", () => {
    const facts = parseManifest("gemma4:12b", json("manifest-gemma4-12b.json"))!;
    expect(facts.weightsGB).toBeCloseTo(7.38, 1);
    // Resident exceeds weights because the vision projector stays loaded.
    expect(facts.residentGB).toBeGreaterThan(facts.weightsGB);
    expect(facts.residentGB).toBeCloseTo(7.56, 1);
    expect(facts.visionCapable).toBe(true);
  });

  it("measures a model with a projector layer consistently", () => {
    const facts = parseManifest("qwen3.6:27b", json("manifest-qwen3.6-27b.json"))!;
    expect(facts.weightsGB).toBeCloseTo(16.84, 1);
    expect(facts.residentGB).toBeCloseTo(17.77, 1);
  });

  it("rejects cloud-only models, which have no local manifest", () => {
    // This is the whole local-runnable test. Without it a 320B cloud model
    // gets recommended to someone's laptop.
    expect(parseManifest("glm-5.3-flash:latest", json("manifest-cloud-only.json"))).toBeNull();
  });

  it("returns null rather than guessing when the model layer is missing", () => {
    expect(parseManifest("x:1b", { layers: [{ mediaType: "other", size: 5 }] })).toBeNull();
    expect(parseManifest("x:1b", { layers: [] })).toBeNull();
    expect(parseManifest("x:1b", {})).toBeNull();
    expect(parseManifest("x:1b", null)).toBeNull();
  });
});
