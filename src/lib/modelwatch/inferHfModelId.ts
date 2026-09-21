/**
 * Guesses the Hugging Face repo id for an Ollama tag, best guess first.
 *
 * hfModelId is the join key mergeCatalog uses to attach popularity facts, so a
 * wrong guess doesn't fail loudly — it silently leaves the row on
 * factsSource: "missing" forever. Every guess is therefore validated against
 * the HF API before use, and a candidate with no resolving guess can be
 * reported but never auto-committed.
 *
 * Ordering matters: the caller validates guesses in sequence and stops at the
 * first hit, so each wrong guess ahead of the right one is a wasted HTTP call.
 * Hence the per-publisher naming conventions below rather than a combinatorial
 * sweep — every id in the current roster resolves within the first few tries.
 */

interface Publisher {
  match: RegExp;
  org: string;
  /** How this publisher renders "family + version", given stem and version. */
  base: (stem: string, version: string) => string[];
  /** Repo-name suffixes this publisher uses, in preference order. */
  suffixes: string[];
  /** Whether sizes appear lowercase ("12b") or uppercase ("12B"). */
  sizeCase: "lower" | "upper" | "both";
}

const PUBLISHERS: Publisher[] = [
  {
    match: /^qwen/,
    org: "Qwen",
    base: (s, v) => [`${cap(s)}${v}`],
    suffixes: ["", "-Instruct"],
    sizeCase: "upper",
  },
  {
    match: /^gemma/,
    org: "google",
    base: (s, v) => [`${s}-${v}`],
    suffixes: ["-it", ""],
    sizeCase: "lower",
  },
  {
    match: /^granite/,
    org: "ibm-granite",
    base: (s, v) => [`${s}-${v}`],
    suffixes: ["", "-instruct"],
    sizeCase: "lower",
  },
  {
    match: /^llama/,
    org: "meta-llama",
    base: (s, v) => [`${cap(s)}-${v}`],
    suffixes: ["-Instruct", ""],
    sizeCase: "upper",
  },
  {
    match: /^muse-/,
    org: "meta-models",
    base: (s) => [s.split("-").map(cap).join("-")],
    suffixes: [""],
    sizeCase: "upper",
  },
  {
    match: /^gpt-oss/,
    org: "openai",
    base: () => ["gpt-oss"],
    suffixes: [""],
    sizeCase: "lower",
  },
  {
    match: /^phi/,
    org: "microsoft",
    base: (s, v) => [`${cap(s)}-${v}`],
    suffixes: ["-instruct", ""],
    sizeCase: "lower",
  },
  {
    match: /^(mistral|ministral|devstral)/,
    org: "mistralai",
    base: (s, v) => [`${cap(s)}-${v}`],
    suffixes: ["-Instruct", ""],
    sizeCase: "upper",
  },
  {
    match: /^deepseek/,
    org: "deepseek-ai",
    base: (s, v) => [`${cap(s)}-${v}`],
    suffixes: [""],
    sizeCase: "upper",
  },
  {
    match: /^nemotron/,
    org: "nvidia",
    base: (s, v) => [`${cap(s)}-${v}`],
    suffixes: [""],
    sizeCase: "upper",
  },
  {
    match: /^glm/,
    org: "zai-org",
    base: (s, v) => [`${s.toUpperCase()}-${v}`],
    suffixes: [""],
    sizeCase: "upper",
  },
  {
    match: /^olmo/,
    org: "allenai",
    base: (s, v) => [`${cap(s)}-${v}`],
    suffixes: [""],
    sizeCase: "upper",
  },
];

/** How many guesses a caller should be willing to spend HTTP calls on. */
export const MAX_HF_GUESSES = 12;

export function inferHfModelIds(
  ollamaName: string,
  /**
   * Other tags in the same family, from the tags page. Ollama shortens a
   * Mixture-of-Experts tag ("gemma4:26b") while Hugging Face keeps the
   * active-param marker ("google/gemma-4-26b-a4b-it"), and the only place that
   * fuller size string exists is the family's sibling tags.
   */
  siblingTags: string[] = []
): string[] {
  const [family, tag = ""] = ollamaName.split(":");
  const publisher = PUBLISHERS.find((p) => p.match.test(family));
  if (!publisher || !tag) return [];

  const version = /^([a-z-]+?)([\d.]+)$/.exec(family);
  const bases = version
    ? publisher.base(version[1], version[2])
    : [family, family.split("-").map(cap).join("-")];

  // Richest size string first: "26b-a4b" is more specific than "26b", and for
  // an MoE model it's the one HF uses.
  const sizes = sizeVariants(tag, siblingTags, publisher.sizeCase).sort(
    (a, b) => b.length - a.length
  );

  const out: string[] = [];
  for (const size of sizes) {
    for (const base of bases) {
      for (const suffix of publisher.suffixes) {
        out.push(`${publisher.org}/${base}-${size}${suffix}`);
      }
    }
  }
  return [...new Set(out)];
}

function sizeVariants(
  tag: string,
  siblingTags: string[],
  sizeCase: Publisher["sizeCase"]
): string[] {
  const raw = new Set<string>([tag]);

  for (const sibling of siblingTags) {
    if (sibling === tag || !sibling.startsWith(`${tag}-`)) continue;
    const active = new RegExp(`^(${escapeRe(tag)}-a\\d+(?:\\.\\d+)?b)`, "i").exec(sibling);
    if (active) raw.add(active[1]);
  }

  const out = new Set<string>();
  for (const s of raw) {
    if (sizeCase !== "upper") out.add(s.toLowerCase());
    if (sizeCase !== "lower") out.add(s.toUpperCase().replace(/_/g, "-"));
  }
  return [...out];
}

function cap(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
