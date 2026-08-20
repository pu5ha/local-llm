import type { EpochFinding } from "./types";

/**
 * Epoch AI (epoch.ai) periodically publishes a "months behind frontier"
 * research conclusion for open-weight models, based on their Epoch
 * Capabilities Index (ECI). This is a research finding, not a live feed, so
 * it's hand-curated here and should be updated (append-only, ascending by
 * asOf) whenever Epoch publishes a new figure.
 */
export const epochFindings: EpochFinding[] = [
  {
    asOf: "2024-11-04",
    monthsBehind: 14,
    confidenceNote: "Benchmark lag ranged 5-25 months across individual evals in this analysis.",
    sourceUrl: "https://epoch.ai/blog/open-models-report",
    sourceLabel: "Epoch AI: Open models report",
  },
  {
    asOf: "2025-10-30",
    monthsBehind: 3.5,
    eciPoints: 7,
    confidenceNote: "90% confidence interval: 1.1-5.3 months.",
    sourceUrl: "https://epoch.ai/data-insights/open-weights-vs-closed-weights-models",
    sourceLabel: "Epoch AI: Open-weight vs. closed-weight models",
  },
  {
    asOf: "2026-05-29",
    monthsBehind: 4,
    eciPoints: 8,
    confidenceNote: "Average lag since January 2026; comparable to the gap between GPT-5 and GPT-5.5.",
    sourceUrl: "https://epoch.ai/data-insights/open-closed-eci-gap",
    sourceLabel: "Epoch AI: Open models lag state-of-the-art closed models by 4 months",
  },
];
