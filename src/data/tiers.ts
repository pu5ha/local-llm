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
  recommendedModel: {
    name: string;
    ollamaCommand: string;
  };
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
      "MacBook Air (M1/M2, 8GB)",
      "Basic Windows laptops",
      "5+ year old computers",
      "Chromebooks with Linux",
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
    recommendedModel: {
      name: "Llama 3.2 3B",
      ollamaCommand: "ollama run llama3.2:3b",
    },
    upgradeInfo: {
      cost: "$40-80",
      action: "Add 8GB more RAM",
      benefit: "Unlock coding help and longer conversations",
    },
    buyingGuide: {
      priceRange: "$400-700",
      examples: [
        "MacBook Air M1 8GB (~$700)",
        "HP Pavilion 8GB (~$500)",
        "Lenovo IdeaPad 8GB (~$450)",
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
      "MacBook Pro (M1/M2/M3, 16GB)",
      "MacBook Air (M2/M3, 16GB)",
      "Gaming laptops (16GB+)",
      "Recent desktop PCs",
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
    recommendedModel: {
      name: "Llama 3.2 8B",
      ollamaCommand: "ollama run llama3.2",
    },
    upgradeInfo: {
      cost: "$100-200",
      action: "Add 16GB more RAM (if possible)",
      benefit: "Faster responses and larger context",
    },
    buyingGuide: {
      priceRange: "$800-1500",
      examples: [
        "MacBook Air M2 16GB (~$1,100)",
        "MacBook Pro 14\" M3 16GB (~$1,600)",
        "ASUS ROG Gaming Laptop 16GB (~$900)",
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
      "Mac Studio (32GB+)",
      "MacBook Pro (32GB+)",
      "High-end gaming PCs",
      "Workstations with dedicated GPUs",
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
    recommendedModel: {
      name: "Llama 3.2 8B (or larger)",
      ollamaCommand: "ollama run llama3.2",
    },
    buyingGuide: {
      priceRange: "$1,500+",
      examples: [
        "Mac Studio M2 Max 32GB (~$2,000)",
        "MacBook Pro 14\" M3 Pro 36GB (~$2,500)",
        "Custom gaming PC 32GB + RTX 4070 (~$1,500)",
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
