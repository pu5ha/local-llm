import { categorizeByKeyword } from "@/lib/news/categorize";

describe("categorizeByKeyword", () => {
  it("matches hardware terms", () => {
    expect(categorizeByKeyword("New NPU benchmarks on the latest laptop")).toBe("hardware");
    expect(categorizeByKeyword("NVIDIA RTX 5090 review")).toBe("hardware");
  });

  it("prefers hardware over models when both terms appear", () => {
    expect(categorizeByKeyword("Running a GGUF model fast on an NPU")).toBe("hardware");
  });

  it("matches model terms", () => {
    expect(categorizeByKeyword("New Llama fine-tune released in GGUF format")).toBe("models");
  });

  it("matches research terms", () => {
    expect(categorizeByKeyword("New arxiv paper shows a benchmark breakthrough")).toBe("research");
  });

  it("matches tools terms", () => {
    expect(categorizeByKeyword("Ollama ships a new release")).toBe("tools");
  });

  it("falls back to general when nothing matches", () => {
    expect(categorizeByKeyword("A completely unrelated headline about gardening")).toBe("general");
  });
});
