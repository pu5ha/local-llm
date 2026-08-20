// Raw summaries from GitHub releases are full of noise that means nothing to
// a reader and wastes tokens if sent to the rewrite model: collapsible
// <details> tags, download-link sections, "Full Changelog" diff URLs, and
// contributor shout-outs. This trims that noise down to the actual content,
// leaving plain prose (from HN/RSS sources, for example) untouched.

const TRUNCATE_AT = [
  /\*\*Website:\*\*/i,
  /\*\*Full Changelog\*\*/i,
  /\*\*Attestations:\*\*/i,
  /\*\*macOS\/iOS:\*\*/i,
  /\*\*Windows:\*\*/i,
  /\*\*Linux:\*\*/i,
  /^##\s*New Contributors/im,
];

export function cleanRawSummary(raw: string | undefined): string | undefined {
  if (!raw) return raw;

  let text = raw;

  // Cut at the first boilerplate boundary, whichever comes first.
  for (const pattern of TRUNCATE_AT) {
    const match = text.match(pattern);
    if (match?.index !== undefined) {
      text = text.slice(0, match.index);
    }
  }

  text = text
    .replace(/<\/?details[^>]*>/gi, "") // <details open> / </details>
    .replace(/^##+\s*/gm, "") // markdown headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
    .replace(/https?:\/\/\S+/g, "") // bare URLs
    .replace(/^\s*[*-]\s+/gm, "") // list bullets
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 0 ? text : undefined;
}
