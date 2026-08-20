import type { NewsCategory } from "./types";

/**
 * Order matters: hardware terms like "NPU" would otherwise get swallowed by
 * the broader "model" pattern, so hardware is checked first.
 */
const KEYWORD_RULES: Array<{ category: NewsCategory; pattern: RegExp }> = [
  {
    category: "hardware",
    pattern:
      /\b(gpu|npu|nvidia|amd|apple silicon|m\d+\s?(ultra|pro|max)|ryzen ai|snapdragon|rtx|radeon|vram|neural engine)\b/i,
  },
  {
    category: "models",
    pattern:
      /\b(model|llm|gguf|quantiz\w*|fine-?tun\w*|checkpoint|weights|llama|qwen|mistral|gemma|phi-\d)\b/i,
  },
  {
    category: "research",
    pattern: /\b(paper|arxiv|research|benchmark|study|breakthrough)\b/i,
  },
  {
    category: "tools",
    pattern:
      /\b(ollama|llama\.cpp|vllm|lm studio|koboldcpp|text-generation-webui|release|inference engine|runtime)\b/i,
  },
];

export function categorizeByKeyword(text: string): NewsCategory {
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return "general";
}
