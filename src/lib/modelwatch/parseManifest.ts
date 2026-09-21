import type { ManifestFacts } from "./types";

const MODEL_LAYER = "application/vnd.ollama.image.model";
const PROJECTOR_LAYER = "application/vnd.ollama.image.projector";
const GB = 1e9;

interface ManifestLayer {
  mediaType?: string;
  size?: number;
}

interface Manifest {
  layers?: ManifestLayer[];
  errors?: Array<{ code?: string }>;
}

/**
 * Reads a Docker v2 manifest from the Ollama registry into measured sizes.
 *
 * This doubles as the "can a user actually pull this?" test: Ollama Cloud
 * models appear in the library listing but have no local manifest, answering
 * MANIFEST_UNKNOWN. Returning null for them is what keeps a 320B cloud-only
 * model out of a recommendation for someone's laptop.
 *
 * Returns null rather than guessing whenever the model layer is absent.
 */
export function parseManifest(
  ollamaName: string,
  body: unknown
): ManifestFacts | null {
  if (!body || typeof body !== "object") return null;
  const manifest = body as Manifest;
  if (manifest.errors?.length) return null;
  if (!Array.isArray(manifest.layers)) return null;

  const model = manifest.layers.find((l) => l.mediaType === MODEL_LAYER);
  if (!model || typeof model.size !== "number" || model.size <= 0) return null;

  const projector = manifest.layers.find((l) => l.mediaType === PROJECTOR_LAYER);
  const projectorSize =
    projector && typeof projector.size === "number" ? projector.size : 0;

  return {
    ollamaName,
    weightsGB: round2(model.size / GB),
    // The projector stays resident for vision models, so it counts toward what
    // the machine has to hold.
    residentGB: round2((model.size + projectorSize) / GB),
    visionCapable: projectorSize > 0,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
