import { cleanRawSummary } from "@/lib/news/plainLanguage/cleanRawSummary";

describe("cleanRawSummary", () => {
  it("strips <details> tags", () => {
    expect(cleanRawSummary("<details open>\n\nhello world\n\n</details>")).toBe(
      "hello world"
    );
  });

  it("truncates at Website/Full Changelog/New Contributors boilerplate", () => {
    expect(
      cleanRawSummary(
        "Add a model metadata cache\n\n**Full Changelog**: https://github.com/x/y/compare/a...b"
      )
    ).toBe("Add a model metadata cache");

    expect(
      cleanRawSummary(
        "<details open>\n\nfix bug\n\n</details>\n\n**Website:**\n- <https://llama.app>"
      )
    ).toBe("fix bug");
  });

  it("converts markdown links to plain text and strips bare URLs", () => {
    expect(cleanRawSummary("See [the docs](https://example.com/docs) for details")).toBe(
      "See the docs for details"
    );
    expect(cleanRawSummary("Download at https://example.com/file.tar.gz now")).toBe(
      "Download at now"
    );
  });

  it("strips markdown headings and list bullets", () => {
    expect(cleanRawSummary("## What's Changed\r\n* Add caching\r\n* Fix bug")).toBe(
      "What's Changed Add caching Fix bug"
    );
  });

  it("leaves normal prose untouched", () => {
    expect(cleanRawSummary("This is a normal sentence.")).toBe(
      "This is a normal sentence."
    );
  });

  it("passes through undefined", () => {
    expect(cleanRawSummary(undefined)).toBeUndefined();
  });

  it("returns undefined if cleaning leaves nothing", () => {
    expect(cleanRawSummary("<details open></details>")).toBeUndefined();
  });
});
