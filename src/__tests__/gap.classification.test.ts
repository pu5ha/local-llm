import { classifyModel } from "@/lib/gap/classification";

describe("classifyModel", () => {
  it("classifies known open creators as open", () => {
    expect(classifyModel("meta-llama", "Meta", "Llama 4")).toBe("open");
    expect(classifyModel("deepseek-ai", "DeepSeek", "DeepSeek V4")).toBe("open");
    expect(classifyModel("moonshot", "Moonshot AI", "Kimi K3")).toBe("open");
  });

  it("classifies known closed creators as closed", () => {
    expect(classifyModel("openai", "OpenAI", "GPT-5.5")).toBe("closed");
    expect(classifyModel("anthropic", "Anthropic", "Claude Opus 4.7")).toBe("closed");
  });

  it("overrides Google's Gemma to open despite Google being closed by default", () => {
    expect(classifyModel("google", "Google", "Gemma 3 27B")).toBe("open");
  });

  it("keeps Google's Gemini as closed", () => {
    expect(classifyModel("google", "Google", "Gemini 3.1 Pro Preview")).toBe("closed");
  });

  it("overrides Microsoft's Phi to open despite Microsoft being closed by default", () => {
    expect(classifyModel("microsoft", "Microsoft", "Phi-4 Mini")).toBe("open");
  });

  it("returns null for an unrecognized creator", () => {
    expect(classifyModel("some-new-lab", "Some New Lab", "Foo Model")).toBeNull();
  });
});
