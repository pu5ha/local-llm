/**
 * Tuning for the model-watch pipeline. Everything the risk rules depend on
 * lives here so the script, the pure helpers and the tests can't drift.
 */

export const LIBRARY_URLS = [
  "https://ollama.com/library?sort=popular",
  "https://ollama.com/library?sort=newest",
];

export const TAGS_URL = (family: string) =>
  `https://ollama.com/library/${family}/tags`;

export const MANIFEST_URL = (family: string, tag: string) =>
  `https://registry.ollama.ai/v2/library/${family}/manifests/${tag}`;

/**
 * Without this header the registry answers 404. `/v2/library/<m>/tags/list`
 * also 404s regardless of headers — tags come from scraping TAGS_URL, so
 * don't reintroduce it.
 */
export const MANIFEST_ACCEPT =
  "application/vnd.docker.distribution.manifest.v2+json";

export const HF_API_BASE = "https://huggingface.co/api/models";

export const FETCH_TIMEOUT_MS = 8000;
export const FETCH_CONCURRENCY = 4;

/**
 * The library listing parsed ~240 entries when this was written. A markup
 * change that breaks the parser shows up as a collapse in that number, and a
 * partly-broken parse is never trusted — the run aborts rather than proposing
 * changes from a fraction of the catalogue.
 */
export const MIN_LIBRARY_ENTRIES = 150;
export const MAX_MISSING_PULLS_RATIO = 0.3;
export const MAX_MANIFEST_FAILURE_RATIO = 0.4;

/** Adoption floor. Below this a model has no community track record yet. */
export const MIN_PULLS = 1_000_000;

/**
 * How stale a family can be and still be a candidate, in days.
 *
 * ~5 months. The local-model field moves roughly two generations a year, so
 * anything older than this has been superseded within its own lineage and
 * should not be able to win a tier on size alone.
 */
export const MAX_AGE_DAYS = 150;
export const MIN_HF_DOWNLOADS = 10_000;

/**
 * A challenger must beat the incumbent's resident size by this factor to be
 * worth a swap. Stops weekly churn between models of near-identical class.
 */
export const MIN_UPGRADE_MARGIN = 1.05;

/**
 * The margin a challenger needs when it would cost the tier its ability to
 * read images.
 *
 * Being able to paste in a screenshot or photo is one of the few local-model
 * features a non-technical reader notices immediately, so trading it away for
 * a marginally bigger model is a bad deal for them. gemma4:31b is 12% larger
 * than qwen3.6:27b and the most-downloaded model in its class, but it is
 * text-only — under this rule it correctly loses, and stops being re-proposed
 * every week.
 */
export const MIN_UPGRADE_MARGIN_LOSING_VISION = 1.25;

/**
 * How much smaller than the incumbent a challenger may be before it counts as
 * a downgrade and is blocked outright.
 *
 * Successive releases are near-identical in size — qwen3.8:27b is 17.74GB
 * against qwen3.6:27b's 17.77GB, a 30MB difference — so a strict "must not be
 * smaller" test would block every version bump as if it were a regression.
 */
export const DOWNGRADE_TOLERANCE = 0.95;

/** Families that are not general-purpose chat models for beginners. */
export const FAMILY_DENYLIST =
  /(embed|embedding|ocr|guardian|safeguard|whisper|tts|rerank|vl$|-vl$|vision$|llava|minicpm-v|coder|code$|math$|uncensored|dolphin|abliterated|openchat)/i;

/** Tag suffixes we never recommend: not local, or not the default quantization. */
export const TAG_DENY =
  /(-cloud$|cloud$|-fp16$|-bf16$|-q8_0$|-q2|-q3|-f16$|-f32$|mlx|-qat|nvfp4|mxfp8)/i;

/** Licenses permissive enough to recommend without caveats. */
export const LICENSE_ALLOWLIST = [
  "apache-2.0",
  "mit",
  "openmdw-1.1",
  "llama3.1",
  "llama3.2",
  "llama3.3",
  "gemma",
];

export const JUDGE_MODEL = "gemini-3.5-flash-lite";
export const JUDGE_BATCH_SIZE = 12;
export const JUDGE_TIMEOUT_MS = 20000;

export const JUDGE_SYSTEM_PROMPT = `You are helping curate a list of local AI models for a website whose readers are non-technical beginners running models on their own laptops.

You will receive candidate models with MEASURED facts already attached: the exact Ollama tag, download size, parameter counts, whether it accepts images, and Hugging Face adoption numbers.

Those facts are measured and authoritative. Never restate, correct, contradict or comment on any size, tag, parameter count or RAM figure. Your output schema has no field for them by design.

For each candidate decide:
- include: is this a genuine general-purpose assistant that a beginner would be well served by? false for coder-only models, roleplay/uncensored finetunes, distills of distills, research artifacts, and anything whose main appeal requires expertise to exploit.
- isBeginnerChatModel: would a non-technical person get a good first experience chatting with it?
- confidence: "high" only when you actually recognise the model and its lineage. "low" if you are inferring from the name.

Then write the copy a beginner reads:
- description: two short sentences, plain language, no jargon, no benchmark names, no marketing superlatives. Say what it is good at and who it suits. Never claim it matches or beats ChatGPT or any commercial product.
- bestFor: three short noun phrases.
- quality / speed: relative to other models a beginner could run locally.

Be conservative. It is much better to exclude a model than to recommend a bad first experience.`;

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Order-of-magnitude bucket, so committed snapshots don't churn weekly. */
export function bucketCount(n: number): string {
  if (n >= 100_000_000) return "100M+";
  if (n >= 10_000_000) return "10M+";
  if (n >= 1_000_000) return "1M+";
  if (n >= 100_000) return "100K+";
  if (n >= 10_000) return "10K+";
  return "<10K";
}
