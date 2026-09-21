import { curatedModels } from "./curated";
import { RAM_TIERS_GB, type RamTierGB } from "./types";

/**
 * The current tier picks as plain strings, for pages that show an example
 * `ollama run` command in prose rather than rendering a catalog entry.
 *
 * These pages used to hardcode tags like `ollama run qwen3:8b`. That quietly
 * rotted: the wizard recommended one model while /help and /guides told the
 * same reader to run a different, older one. Deriving them here means the
 * model-watch pipeline updates every mention of a model in one place.
 */
function pickFor(ramGB: RamTierGB): { tag: string; name: string } {
  const model = curatedModels.find((m) => m.recommendedForRamGB === ramGB);
  // curated.json always fills every tier — catalog.curatedData.test.ts asserts
  // it — so this fallback only exists to keep the type honest.
  if (!model) return { tag: "qwen3.5:4b", name: "Qwen3.5 4B" };
  // `name` in the catalog is the family only ("Qwen3.5"), because components
  // render it next to a separate parameter-count span. These strings appear in
  // running prose with no such span, so the size is folded in here.
  const parameters = Number.isInteger(model.parametersB)
    ? `${model.parametersB}B`
    : `${model.parametersB.toFixed(1)}B`;
  return { tag: model.ollamaName, name: `${model.name} ${parameters}` };
}

const [SMALL, MID, LARGE, TOP] = RAM_TIERS_GB;

/** The 8GB pick — the safe default when a page needs one example. */
export const ENTRY_MODEL = pickFor(SMALL);
/** The 16GB pick. */
export const STANDARD_MODEL = pickFor(MID);
/** The 32GB pick. */
export const POWER_MODEL = pickFor(LARGE);
/** The 64GB pick. */
export const FLAGSHIP_MODEL = pickFor(TOP);
