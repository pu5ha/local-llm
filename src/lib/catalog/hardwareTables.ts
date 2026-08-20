/**
 * Data-driven GPU/VRAM and Apple Silicon lookup tables. Adding support for a
 * new GPU generation or chip is a new array entry here, not a code change in
 * useHardwareDetection.ts.
 */

export interface GpuVramEntry {
  match: RegExp; // matched against the lowercased WebGL renderer string
  vramGB: number;
}

// Ordered most-specific-first; first match wins.
export const GPU_VRAM_TABLE: GpuVramEntry[] = [
  // NVIDIA RTX 50-series (Blackwell)
  { match: /rtx 5090/, vramGB: 32 },
  { match: /rtx 5080/, vramGB: 16 },
  { match: /rtx 5070 ti/, vramGB: 16 },
  { match: /rtx 5070/, vramGB: 12 },
  { match: /rtx 5060 ti/, vramGB: 16 },
  { match: /rtx 5060/, vramGB: 8 },
  // NVIDIA RTX 40-series
  { match: /rtx 4090/, vramGB: 24 },
  { match: /rtx 4080/, vramGB: 16 },
  { match: /rtx 4070 ti/, vramGB: 12 },
  { match: /rtx 4070/, vramGB: 12 },
  { match: /rtx 4060 ti/, vramGB: 8 },
  { match: /rtx 4060/, vramGB: 8 },
  // NVIDIA RTX 30-series
  { match: /rtx 3090/, vramGB: 24 },
  { match: /rtx 3080 ti/, vramGB: 12 },
  { match: /rtx 3080/, vramGB: 10 },
  { match: /rtx 3070 ti/, vramGB: 8 },
  { match: /rtx 3070/, vramGB: 8 },
  { match: /rtx 3060 ti/, vramGB: 8 },
  { match: /rtx 3060/, vramGB: 12 },
  { match: /rtx 3050/, vramGB: 8 },
  // NVIDIA RTX 20-series
  { match: /rtx 2080 ti/, vramGB: 11 },
  { match: /rtx 2080/, vramGB: 8 },
  { match: /rtx 2070/, vramGB: 8 },
  { match: /rtx 2060/, vramGB: 6 },
  // NVIDIA GTX 16/10-series
  { match: /gtx 1660/, vramGB: 6 },
  { match: /gtx 1650/, vramGB: 4 },
  { match: /gtx 1080 ti/, vramGB: 11 },
  { match: /gtx 1080/, vramGB: 8 },
  { match: /gtx 1070/, vramGB: 8 },
  { match: /gtx 1060/, vramGB: 6 },
  { match: /gtx 1050/, vramGB: 4 },
  // AMD RX 9000-series (RDNA4)
  { match: /rx 9070 xt/, vramGB: 16 },
  { match: /rx 9070/, vramGB: 16 },
  { match: /rx 9060 xt/, vramGB: 16 },
  // AMD RX 7000/6000-series
  { match: /rx 7900/, vramGB: 20 },
  { match: /rx 7800/, vramGB: 16 },
  { match: /rx 7700/, vramGB: 12 },
  { match: /rx 7600/, vramGB: 8 },
  { match: /rx 6900/, vramGB: 16 },
  { match: /rx 6800/, vramGB: 16 },
  { match: /rx 6700/, vramGB: 12 },
  { match: /rx 6600/, vramGB: 8 },
];

export function lookupVramGB(gpuLower: string): number | null {
  return GPU_VRAM_TABLE.find((e) => e.match.test(gpuLower))?.vramGB ?? null;
}

export interface DiscreteGpuHint {
  match: RegExp;
  suggestedRamGB: number;
  reason: string;
}

// Used when we can't estimate exact VRAM but detect a class of discrete GPU,
// to suggest a likely system-RAM tier (not VRAM).
export const DISCRETE_GPU_RAM_HINTS: DiscreteGpuHint[] = [
  { match: /rtx 50|rtx 40|rtx 30/, suggestedRamGB: 32, reason: "High-end NVIDIA GPU detected" },
  { match: /rtx|gtx 10|gtx 16/, suggestedRamGB: 16, reason: "NVIDIA gaming GPU detected" },
];

export interface AppleSiliconCoreRange {
  minCores: number;
  suggestedRamGB: number;
  label: string;
}

export interface AppleSiliconEntry {
  match: RegExp; // chip family, e.g. /\bm5\b/
  coreRanges: AppleSiliconCoreRange[]; // ordered highest-minCores-first
}

// Chip-generation-specific tables PLUS a generic fallback bucket (last entry)
// used for any Apple Silicon renderer string that doesn't match a known chip
// name — e.g. a future M6 — so guidance degrades gracefully instead of
// silently mis-guessing forever.
export const APPLE_SILICON_TABLE: AppleSiliconEntry[] = [
  {
    match: /\bm5\b/,
    coreRanges: [
      { minCores: 14, suggestedRamGB: 36, label: "Apple M5 Pro/Max-class Mac" },
      { minCores: 0, suggestedRamGB: 16, label: "Apple M5 Mac" },
    ],
  },
  {
    match: /\bm4\b/,
    coreRanges: [
      { minCores: 14, suggestedRamGB: 36, label: "Apple M4 Pro/Max-class Mac" },
      { minCores: 0, suggestedRamGB: 16, label: "Apple M4 Mac" }, // M4 base has no 8GB SKU
    ],
  },
  {
    match: /\bm[1-3]\b/,
    coreRanges: [
      { minCores: 14, suggestedRamGB: 32, label: "Apple Silicon Mac (high-performance chip)" },
      { minCores: 0, suggestedRamGB: 16, label: "Apple Silicon Mac" },
    ],
  },
  // Generic fallback for any unrecognized Apple Silicon chip name.
  {
    match: /.^/, // never matches directly — used only as the final fallback below
    coreRanges: [
      { minCores: 14, suggestedRamGB: 32, label: "Apple Silicon Mac (high-performance chip)" },
      { minCores: 0, suggestedRamGB: 16, label: "Apple Silicon Mac" },
    ],
  },
];

export function getAppleSiliconSuggestion(
  gpuLower: string,
  cores: number | null
): { suggestedRamGB: number; label: string } {
  const family =
    APPLE_SILICON_TABLE.slice(0, -1).find((f) => f.match.test(gpuLower)) ??
    APPLE_SILICON_TABLE[APPLE_SILICON_TABLE.length - 1];
  const c = cores ?? 0;
  const bucket =
    family.coreRanges.find((r) => c >= r.minCores) ??
    family.coreRanges[family.coreRanges.length - 1];
  return { suggestedRamGB: bucket.suggestedRamGB, label: bucket.label };
}
