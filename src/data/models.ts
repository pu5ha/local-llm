export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  parameters: string;
  ramRequired: string;
  ramRequiredGB: number;
  bestFor: string[];
  quality: "excellent" | "great" | "good";
  speed: "fast" | "medium" | "slow";
  ollamaName?: string;
  lmStudioName?: string;
  featured?: boolean;
}

export const models: Model[] = [
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2",
    provider: "Meta",
    description:
      "Meta's latest compact model. Excellent for general tasks with minimal hardware requirements.",
    parameters: "3B",
    ramRequired: "4GB",
    ramRequiredGB: 4,
    bestFor: ["General chat", "Quick tasks", "Low-end hardware"],
    quality: "good",
    speed: "fast",
    ollamaName: "llama3.2",
    lmStudioName: "llama-3.2-3b",
    featured: true,
  },
  {
    id: "llama-3.2-8b",
    name: "Llama 3.2",
    provider: "Meta",
    description:
      "Balanced model offering great performance across various tasks. The sweet spot for most users.",
    parameters: "8B",
    ramRequired: "8GB",
    ramRequiredGB: 8,
    bestFor: ["General chat", "Writing", "Analysis"],
    quality: "great",
    speed: "medium",
    ollamaName: "llama3.2:8b",
    lmStudioName: "llama-3.2-8b",
    featured: true,
  },
  {
    id: "mistral-7b",
    name: "Mistral",
    provider: "Mistral AI",
    description:
      "Efficient European model known for its strong reasoning and coding capabilities.",
    parameters: "7B",
    ramRequired: "8GB",
    ramRequiredGB: 8,
    bestFor: ["Reasoning", "Coding", "Analysis"],
    quality: "great",
    speed: "fast",
    ollamaName: "mistral",
    lmStudioName: "mistral-7b",
    featured: true,
  },
  {
    id: "phi-3-mini",
    name: "Phi-3 Mini",
    provider: "Microsoft",
    description:
      "Microsoft's compact powerhouse. Punches above its weight class for coding and reasoning.",
    parameters: "3.8B",
    ramRequired: "4GB",
    ramRequiredGB: 4,
    bestFor: ["Coding", "Reasoning", "Math"],
    quality: "great",
    speed: "fast",
    ollamaName: "phi3",
    lmStudioName: "phi-3-mini",
  },
  {
    id: "gemma-2-9b",
    name: "Gemma 2",
    provider: "Google",
    description:
      "Google's open model with strong instruction-following and conversational abilities.",
    parameters: "9B",
    ramRequired: "10GB",
    ramRequiredGB: 10,
    bestFor: ["Conversation", "Instructions", "Creative writing"],
    quality: "great",
    speed: "medium",
    ollamaName: "gemma2",
    lmStudioName: "gemma-2-9b",
  },
  {
    id: "qwen-2.5-7b",
    name: "Qwen 2.5",
    provider: "Alibaba",
    description:
      "Multilingual powerhouse with excellent coding abilities. Great for international users.",
    parameters: "7B",
    ramRequired: "8GB",
    ramRequiredGB: 8,
    bestFor: ["Multilingual", "Coding", "General"],
    quality: "great",
    speed: "fast",
    ollamaName: "qwen2.5",
    lmStudioName: "qwen-2.5-7b",
  },
  {
    id: "deepseek-coder-6.7b",
    name: "DeepSeek Coder",
    provider: "DeepSeek",
    description:
      "Specialized coding model trained on 2T tokens of code. Best-in-class for programming tasks.",
    parameters: "6.7B",
    ramRequired: "8GB",
    ramRequiredGB: 8,
    bestFor: ["Coding", "Code review", "Debugging"],
    quality: "excellent",
    speed: "fast",
    ollamaName: "deepseek-coder",
    lmStudioName: "deepseek-coder-6.7b",
    featured: true,
  },
  {
    id: "codellama-13b",
    name: "Code Llama",
    provider: "Meta",
    description:
      "Meta's dedicated coding model. Excellent for code generation and completion.",
    parameters: "13B",
    ramRequired: "16GB",
    ramRequiredGB: 16,
    bestFor: ["Code generation", "Completion", "Explanation"],
    quality: "excellent",
    speed: "medium",
    ollamaName: "codellama",
    lmStudioName: "codellama-13b",
  },
];

export const getFeaturedModels = () => models.filter((m) => m.featured);

export const getModelsByRam = (availableRamGB: number) =>
  models.filter((m) => m.ramRequiredGB <= availableRamGB);
