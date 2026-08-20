import type { Model } from "@/lib/catalog/types";
import { getRecommendedModel } from "@/lib/catalog/recommend";

export type TierId = "entry" | "standard" | "power";

export interface Tier {
  id: TierId;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  description: string;
  ramRequired: number;
  exampleComputers: string[];
  capabilities: string[];
  limitations: string[];
  stretchNote?: string;
  upgradeInfo?: {
    cost: string;
    action: string;
    benefit: string;
  };
  buyingGuide: {
    priceRange: string;
    examples: string[];
  };
}

// Never hardcode a chip generation (M1/M2/M3/M4...) here — it dates within a
// year. Describe hardware by RAM amount and "current [Mac line]" instead.
export const tiers: Record<TierId, Tier> = {
  entry: {
    id: "entry",
    name: "Entry",
    emoji: "🟢",
    color: "green",
    tagline: "Great for getting started",
    description: "Perfect for basic AI tasks. Your computer can handle simple conversations and quick questions.",
    ramRequired: 8,
    exampleComputers: [
      "Any Mac with 8GB unified memory",
      "Budget or older Windows laptops (most made in the last 5-6 years)",
      "Chromebooks with Linux (Crostini) enabled",
    ],
    capabilities: [
      "Chat with AI privately",
      "Get quick answers to questions",
      "Basic writing help (emails, short texts)",
      "Simple brainstorming",
    ],
    limitations: [
      "Complex coding assistance",
      "Long document analysis",
      "Extended conversations",
      "Fast response times",
    ],
    upgradeInfo: {
      cost: "$40-80",
      action: "Add 8GB more RAM",
      benefit: "Unlock coding help and longer conversations",
    },
    buyingGuide: {
      priceRange: "$400-700",
      examples: [
        "Entry-level MacBook Air, any current generation, 8GB config (~$700-900)",
        "Budget Windows laptop with 8GB RAM (~$400-600)",
        "Refurbished business laptop, 8GB RAM (~$250-400)",
      ],
    },
  },
  standard: {
    id: "standard",
    name: "Standard",
    emoji: "🟡",
    color: "amber",
    tagline: "The sweet spot for most people",
    description: "Handle most AI tasks comfortably. Great for coding help, document analysis, and extended conversations.",
    ramRequired: 16,
    exampleComputers: [
      "Any current Mac (MacBook Air/Pro, Mac mini) with 16GB unified memory",
      "Gaming or creator laptops with 16GB+ RAM",
      "Recent desktop PCs with 16GB RAM",
    ],
    capabilities: [
      "Everything in Entry tier",
      "Coding assistance and debugging",
      "Document analysis and summarization",
      "Longer, more coherent conversations",
      "Creative writing projects",
    ],
    limitations: [
      "Very large codebases",
      "Book-length documents",
      "Instant responses on complex tasks",
    ],
    upgradeInfo: {
      cost: "$100-200",
      action: "Add 16GB more RAM (if possible)",
      benefit: "Faster responses and larger context",
    },
    buyingGuide: {
      priceRange: "$800-1500",
      examples: [
        "Current MacBook Air, 16GB config (~$1,000-1,300)",
        "Current MacBook Pro, 16GB config (~$1,500-1,800)",
        "Windows gaming laptop, 16GB RAM (~$900-1,200)",
      ],
    },
  },
  power: {
    id: "power",
    name: "Power",
    emoji: "🔵",
    color: "blue",
    tagline: "Maximum capability",
    description: "Handle any AI task with speed. Best for professionals, developers, and power users who need the fastest, most capable models.",
    ramRequired: 32,
    exampleComputers: [
      "Any Mac with 32GB+ unified memory (Mac mini, MacBook Pro, Mac Studio)",
      "High-end gaming or workstation laptops with 32GB+ RAM",
      "Desktop PC with a dedicated GPU (16GB+ VRAM) or 32GB+ system RAM",
    ],
    capabilities: [
      "Everything in Standard tier",
      "Complex coding across large projects",
      "Analyze book-length documents",
      "Fast responses on all tasks",
      "Run the largest, most capable models",
      "Multiple AI tasks simultaneously",
    ],
    limitations: [],
    stretchNote:
      "Have 64GB or more? You can step up to 70B-class reasoning models like DeepSeek R1-Distill-Llama-70B — the closest thing to frontier-model quality running entirely on your own machine.",
    buyingGuide: {
      priceRange: "$1,500+",
      examples: [
        "Current Mac with 32GB+ unified memory (~$2,000+)",
        "Custom desktop, 32GB RAM + 16GB+ VRAM GPU (~$1,500-2,500)",
        "Workstation laptop, 32GB+ RAM (~$2,200+)",
      ],
    },
  },
};

export const tierOrder: TierId[] = ["entry", "standard", "power"];

export function getTierForRam(ramGB: number): TierId | null {
  if (ramGB >= 32) return "power";
  if (ramGB >= 16) return "standard";
  if (ramGB >= 8) return "entry";
  return null; // Below minimum - can't run local LLMs
}

export function getTierById(id: TierId): Tier {
  return tiers[id];
}

export function getAllTiers(): Tier[] {
  return tierOrder.map((id) => tiers[id]);
}

/** Computed from the live catalog, not hand-typed — single source of truth. */
export function getTierRecommendation(
  tier: Tier,
  catalog: Model[]
): { name: string; ollamaCommand: string } | null {
  const { primary } = getRecommendedModel(catalog, { ramGB: tier.ramRequired });
  if (!primary) return null;
  return { name: primary.name, ollamaCommand: `ollama run ${primary.ollamaName}` };
}
