export interface Tool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  platforms: ("windows" | "mac" | "linux")[];
  features: string[];
  pros: string[];
  cons: string[];
  website: string;
  downloadUrl: string;
  featured?: boolean;
}

export const tools: Tool[] = [
  {
    id: "ollama",
    name: "Ollama",
    tagline: "The easiest way to run LLMs",
    description:
      "Ollama is the most beginner-friendly option for running LLMs locally. It handles model downloads, memory management, and provides a simple command-line interface. Perfect for getting started quickly.",
    difficulty: "beginner",
    platforms: ["mac", "linux", "windows"],
    features: [
      "One-command model downloads",
      "Automatic memory management",
      "Built-in API server",
      "Model library with 100+ models",
      "Works with most AI apps",
    ],
    pros: [
      "Extremely easy setup",
      "Great documentation",
      "Active community",
      "Frequent updates",
    ],
    cons: [
      "Command-line only (no GUI)",
      "Limited model customization",
    ],
    website: "https://ollama.ai",
    downloadUrl: "https://ollama.ai/download",
    featured: true,
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    tagline: "A beautiful desktop app for local LLMs",
    description:
      "LM Studio provides a polished graphical interface for running LLMs locally. Browse and download models from Hugging Face, chat with them, and even run a local API server—all without touching the command line.",
    difficulty: "beginner",
    platforms: ["mac", "linux", "windows"],
    features: [
      "Beautiful chat interface",
      "Browse Hugging Face models",
      "One-click model downloads",
      "Built-in API server",
      "GPU acceleration",
    ],
    pros: [
      "No command line needed",
      "Intuitive interface",
      "Easy model discovery",
      "Good for beginners",
    ],
    cons: [
      "Larger download size",
      "Less flexible than CLI tools",
    ],
    website: "https://lmstudio.ai",
    downloadUrl: "https://lmstudio.ai",
    featured: true,
  },
  {
    id: "gpt4all",
    name: "GPT4All",
    tagline: "Privacy-focused AI for everyone",
    description:
      "GPT4All is an open-source project focused on making AI accessible to everyone. It provides a simple desktop application with curated models optimized for consumer hardware.",
    difficulty: "beginner",
    platforms: ["mac", "linux", "windows"],
    features: [
      "Simple desktop app",
      "Curated model selection",
      "Document Q&A (LocalDocs)",
      "Optimized for consumer hardware",
      "Open source",
    ],
    pros: [
      "Very beginner-friendly",
      "Document chat feature",
      "Optimized models",
      "Open source",
    ],
    cons: [
      "Fewer model options",
      "Less frequent updates",
    ],
    website: "https://gpt4all.io",
    downloadUrl: "https://gpt4all.io",
    featured: true,
  },
  {
    id: "llama-cpp",
    name: "llama.cpp",
    tagline: "High-performance inference engine",
    description:
      "llama.cpp is a powerful C/C++ implementation for running LLMs with maximum efficiency. It's the engine behind many other tools and offers the most control over model execution.",
    difficulty: "advanced",
    platforms: ["mac", "linux", "windows"],
    features: [
      "Maximum performance",
      "CPU and GPU support",
      "Quantization options",
      "Memory mapping",
      "Server mode",
    ],
    pros: [
      "Best performance",
      "Most control",
      "Active development",
      "Foundation for other tools",
    ],
    cons: [
      "Requires compilation",
      "Command-line only",
      "Steeper learning curve",
    ],
    website: "https://github.com/ggerganov/llama.cpp",
    downloadUrl: "https://github.com/ggerganov/llama.cpp/releases",
  },
];

export const getFeaturedTools = () => tools.filter((t) => t.featured);

export const getToolsByDifficulty = (difficulty: Tool["difficulty"]) =>
  tools.filter((t) => t.difficulty === difficulty);
