import type { CuratedModel } from "./types";
import curatedData from "./data/curated.json";

/**
 * Curated model roster. This is the ONLY place that decides which models get
 * shown as "featured" (recommended to a beginner). Popularity/freshness facts
 * are enriched at runtime from Hugging Face — see mergeCatalog.ts.
 *
 * The data lives in ./data/curated.json rather than inline here so that
 * scripts/refresh-modelwatch.ts can rewrite it deterministically: serialising
 * JSON with a fixed key order produces a diff that is exactly the semantic
 * change, with no comment-preservation or formatting drift to churn every week.
 * Hand edits are equally welcome — src/__tests__/catalog.curatedData.test.ts
 * validates the shape, the tier assignments and that each tier's pick really
 * fits its RAM budget, so a typo fails the suite rather than reaching a user.
 *
 * ollamaName tags are spot-checked against https://ollama.com/library and
 * hfModelId against https://huggingface.co/api/models/<id> at review time,
 * since both occasionally change. weightsGB is measured, never estimated —
 * it comes from the Ollama registry manifest for that exact tag.
 */
export const curatedModels = curatedData as CuratedModel[];

export const getFeaturedCurated = () => curatedModels.filter((m) => m.featured);
