import type { CuratedModel } from "./types";

/**
 * Hand-curated model roster. This is the ONLY place that decides which models
 * get shown as "featured" (recommended to a beginner). Popularity/freshness
 * facts are enriched at runtime from Hugging Face — see mergeCatalog.ts —
 * this file only ever changes by direct owner edit.
 *
 * ollamaName tags should be spot-checked against https://ollama.com/library
 * and hfModelId against https://huggingface.co/api/models/<id> at review
 * time, since both occasionally change.
 */
export const curatedModels: CuratedModel[] = [
  {
    id: "llama-3.2-3b",
    ollamaName: "llama3.2",
    hfModelId: "meta-llama/Llama-3.2-3B-Instruct",
    lmStudioName: "llama-3.2-3b",
    name: "Llama 3.2",
    provider: "Meta",
    description:
      "Meta's smallest current model. Fast and low-RAM — a safe pick for older or budget hardware.",
    bestFor: ["General chat", "Quick tasks", "Low-end hardware"],
    quality: "good",
    speed: "fast",
    featured: true,
    curatedAt: "2026-08-19",
    parametersB: 3,
  },
  {
    id: "qwen3-4b",
    ollamaName: "qwen3:4b",
    hfModelId: "Qwen/Qwen3-4B",
    lmStudioName: "qwen3-4b",
    name: "Qwen3",
    provider: "Alibaba",
    description:
      "Punches well above its size class, with an optional 'thinking' mode for harder questions. The best all-around pick for entry-level hardware.",
    bestFor: ["General chat", "Reasoning", "Coding basics"],
    quality: "great",
    speed: "fast",
    featured: true,
    curatedAt: "2026-08-19",
    parametersB: 4,
  },
  {
    id: "gemma-3-4b",
    ollamaName: "gemma3:4b",
    hfModelId: "google/gemma-3-4b-it",
    lmStudioName: "gemma-3-4b",
    name: "Gemma 3",
    provider: "Google",
    description:
      "Google's efficient small model. Strong multilingual support and light image understanding.",
    bestFor: ["Multilingual", "Writing", "Vision-lite"],
    quality: "good",
    speed: "fast",
    curatedAt: "2026-08-19",
    parametersB: 4,
  },
  {
    id: "phi-4-mini",
    ollamaName: "phi4-mini",
    hfModelId: "microsoft/Phi-4-mini-instruct",
    lmStudioName: "phi-4-mini",
    name: "Phi-4 Mini",
    provider: "Microsoft",
    description:
      "A compact model tuned specifically for math and step-by-step reasoning.",
    bestFor: ["Math", "Reasoning", "STEM help"],
    quality: "great",
    speed: "fast",
    curatedAt: "2026-08-19",
    parametersB: 3.8,
  },
  {
    id: "llama-3.1-8b",
    ollamaName: "llama3.1",
    hfModelId: "meta-llama/Llama-3.1-8B-Instruct",
    lmStudioName: "llama-3.1-8b",
    name: "Llama 3.1",
    provider: "Meta",
    description:
      "The reliable all-rounder. Huge community support and works well for almost anything.",
    bestFor: ["General chat", "Writing", "Analysis"],
    quality: "great",
    speed: "medium",
    curatedAt: "2026-08-19",
    parametersB: 8,
  },
  {
    id: "qwen3-8b",
    ollamaName: "qwen3:8b",
    hfModelId: "Qwen/Qwen3-8B",
    lmStudioName: "qwen3-8b",
    name: "Qwen3",
    provider: "Alibaba",
    description:
      "Excellent coding and multilingual ability for mid-range hardware. The best all-around pick once you have 16GB of RAM.",
    bestFor: ["Coding", "Multilingual", "General"],
    quality: "excellent",
    speed: "medium",
    featured: true,
    curatedAt: "2026-08-19",
    parametersB: 8,
  },
  {
    id: "deepseek-r1-distill-qwen-7b",
    ollamaName: "deepseek-r1:7b",
    hfModelId: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    lmStudioName: "deepseek-r1-distill-qwen-7b",
    name: "DeepSeek R1 (Distill)",
    provider: "DeepSeek",
    description:
      "A reasoning-trained distill of DeepSeek R1. Shows its work step-by-step — great at logic and math puzzles.",
    bestFor: ["Reasoning", "Math", "Coding"],
    quality: "excellent",
    speed: "slow",
    curatedAt: "2026-08-19",
    parametersB: 7,
  },
  {
    id: "gemma-3-12b",
    ollamaName: "gemma3:12b",
    hfModelId: "google/gemma-3-12b-it",
    lmStudioName: "gemma-3-12b",
    name: "Gemma 3",
    provider: "Google",
    description:
      "The bigger Gemma. Strong instruction-following, creative writing, and image understanding.",
    bestFor: ["Conversation", "Instructions", "Creative writing"],
    quality: "great",
    speed: "medium",
    curatedAt: "2026-08-19",
    parametersB: 12,
  },
  {
    id: "qwen3-32b",
    ollamaName: "qwen3:32b",
    hfModelId: "Qwen/Qwen3-32B",
    lmStudioName: "qwen3-32b",
    name: "Qwen3",
    provider: "Alibaba",
    description:
      "Flagship-class open model. Handles multi-step tasks and larger codebases with ease — the best pick once you have 32GB of RAM.",
    bestFor: ["Coding", "Complex reasoning", "Long documents"],
    quality: "excellent",
    speed: "medium",
    featured: true,
    curatedAt: "2026-08-19",
    parametersB: 32,
  },
  {
    id: "gpt-oss-20b",
    ollamaName: "gpt-oss:20b",
    hfModelId: "openai/gpt-oss-20b",
    lmStudioName: "gpt-oss-20b",
    name: "gpt-oss",
    provider: "OpenAI",
    description:
      "OpenAI's first open-weight release since GPT-2, tuned for tool-use and agentic tasks. Runs on a 32GB Mac or a high-end consumer GPU.",
    bestFor: ["Tool use", "Coding", "Agentic tasks"],
    quality: "excellent",
    speed: "medium",
    curatedAt: "2026-08-19",
    parametersB: 20,
  },
  {
    id: "mistral-small-3.1-24b",
    ollamaName: "mistral-small3.1",
    hfModelId: "mistralai/Mistral-Small-3.1-24B-Instruct-2503",
    lmStudioName: "mistral-small-3.1-24b",
    name: "Mistral Small 3.1",
    provider: "Mistral AI",
    description:
      "Strong reasoning and coding with native image understanding. Apache 2.0 licensed.",
    bestFor: ["Reasoning", "Coding", "Vision"],
    quality: "excellent",
    speed: "medium",
    curatedAt: "2026-08-19",
    parametersB: 24,
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    ollamaName: "deepseek-r1:70b",
    hfModelId: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
    lmStudioName: "deepseek-r1-distill-llama-70b",
    name: "DeepSeek R1 (Distill)",
    provider: "DeepSeek",
    description:
      "The closest a home computer gets to frontier-model reasoning quality. A stretch pick for 64GB+ machines — not part of the default recommendations.",
    bestFor: ["Advanced reasoning", "Research", "Coding"],
    quality: "excellent",
    speed: "slow",
    curatedAt: "2026-08-19",
    parametersB: 70,
  },
];

export const getFeaturedCurated = () => curatedModels.filter((m) => m.featured);
