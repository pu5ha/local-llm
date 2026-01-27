import { TierId } from "./tiers";

export type UseCaseId = "chat" | "coding" | "writing" | "creative" | "images";

export interface UseCase {
  id: UseCaseId;
  name: string;
  emoji: string;
  shortDescription: string;
  description: string;
  minimumTier: TierId;
  recommendedTier: TierId;
  examplePrompts: string[];
  benefits: string[];
}

export const useCases: Record<UseCaseId, UseCase> = {
  chat: {
    id: "chat",
    name: "Chat & Ask Questions",
    emoji: "💬",
    shortDescription: "Like ChatGPT, but 100% private",
    description:
      "Have conversations with AI to get answers, brainstorm ideas, learn new things, or just chat. Everything stays on your computer—no data sent anywhere.",
    minimumTier: "entry",
    recommendedTier: "entry",
    examplePrompts: [
      "What's the difference between affect and effect?",
      "Explain quantum computing like I'm 10",
      "Help me plan a weekend trip to Austin",
      "What are some healthy dinner ideas for two?",
    ],
    benefits: [
      "Get instant answers without searching",
      "No subscription fees like ChatGPT Plus",
      "Works without internet",
      "Your questions stay private",
    ],
  },
  coding: {
    id: "coding",
    name: "Help with Coding",
    emoji: "💻",
    shortDescription: "Your private coding assistant",
    description:
      "Get help writing code, debugging errors, explaining concepts, and reviewing your work. Great for both beginners learning to code and experienced developers.",
    minimumTier: "standard",
    recommendedTier: "standard",
    examplePrompts: [
      "Write a Python function to sort a list of names",
      "Why is my React component re-rendering too often?",
      "Explain what this regex does: ^[a-zA-Z0-9]+$",
      "Convert this JavaScript to TypeScript",
    ],
    benefits: [
      "Keep your proprietary code private",
      "Get help without sharing code with external services",
      "Works offline—code on airplanes",
      "No API costs for heavy usage",
    ],
  },
  writing: {
    id: "writing",
    name: "Writing & Editing",
    emoji: "✍️",
    shortDescription: "Polish your writing privately",
    description:
      "Get help drafting emails, editing documents, improving your writing, and more. Perfect for work documents you don't want to share with cloud services.",
    minimumTier: "entry",
    recommendedTier: "standard",
    examplePrompts: [
      "Make this email sound more professional",
      "Proofread this paragraph for grammar",
      "Help me write a cover letter for a marketing job",
      "Summarize this article in 3 bullet points",
    ],
    benefits: [
      "Edit sensitive work documents privately",
      "Improve writing without judgment",
      "Works for any language or style",
      "Great for non-native English speakers",
    ],
  },
  creative: {
    id: "creative",
    name: "Creative Projects",
    emoji: "🎨",
    shortDescription: "Brainstorm and create privately",
    description:
      "Brainstorm ideas, write stories, develop characters, plan projects, and explore creative concepts. Your creative process stays between you and your computer.",
    minimumTier: "standard",
    recommendedTier: "power",
    examplePrompts: [
      "Help me brainstorm names for my podcast",
      "Write a short story about a time-traveling chef",
      "Give me 10 unique birthday party themes",
      "Help me develop a character for my novel",
    ],
    benefits: [
      "Protect your creative ideas",
      "Explore without self-censorship",
      "No one sees your rough drafts",
      "Unlimited brainstorming sessions",
    ],
  },
  images: {
    id: "images",
    name: "Generate Images",
    emoji: "🖼️",
    shortDescription: "Create images from descriptions",
    description:
      "Turn text descriptions into images using AI. Create art, illustrations, concept designs, and more—all privately on your computer. No one sees what you make.",
    minimumTier: "standard",
    recommendedTier: "power",
    examplePrompts: [
      "A cozy coffee shop on a rainy day, watercolor style",
      "Futuristic city skyline at sunset, cyberpunk aesthetic",
      "Golden retriever puppy in autumn leaves, professional photo",
      "Fantasy castle on a floating island, digital art",
    ],
    benefits: [
      "Complete privacy—images never uploaded",
      "No watermarks or usage restrictions",
      "Unlimited generations, no credits needed",
      "Works offline once set up",
    ],
  },
};

// Images removed from main flow - too complex for initial release
export const useCaseOrder: UseCaseId[] = ["chat", "coding", "writing", "creative"];

export function getUseCaseById(id: UseCaseId): UseCase {
  return useCases[id];
}

export function getAllUseCases(): UseCase[] {
  return useCaseOrder.map((id) => useCases[id]);
}

export function getUseCasesForTier(tierId: TierId): UseCase[] {
  const tierRank = { entry: 1, standard: 2, power: 3 };
  const userRank = tierRank[tierId];

  return getAllUseCases().filter((uc) => {
    const requiredRank = tierRank[uc.minimumTier];
    return requiredRank <= userRank;
  });
}
