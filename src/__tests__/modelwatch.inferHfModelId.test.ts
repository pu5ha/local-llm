import { inferHfModelIds, MAX_HF_GUESSES } from "@/lib/modelwatch/inferHfModelId";

/**
 * Every expected id here was verified to return 200 with a real `id` field
 * from https://huggingface.co/api/models/<id>. The index assertions matter as
 * much as the hits: the pipeline validates guesses in order over the network,
 * so a right answer buried at position 25 costs 25 wasted requests.
 */
describe("inferHfModelIds", () => {
  const cases: Array<{
    ollamaName: string;
    expected: string;
    siblingTags?: string[];
  }> = [
    { ollamaName: "qwen3.5:2b", expected: "Qwen/Qwen3.5-2B" },
    { ollamaName: "qwen3.5:4b", expected: "Qwen/Qwen3.5-4B" },
    { ollamaName: "qwen3.5:9b", expected: "Qwen/Qwen3.5-9B" },
    { ollamaName: "qwen3.6:27b", expected: "Qwen/Qwen3.6-27B" },
    { ollamaName: "qwen3.6:35b-a3b", expected: "Qwen/Qwen3.6-35B-A3B" },
    { ollamaName: "gemma4:12b", expected: "google/gemma-4-12b-it" },
    { ollamaName: "gemma4:31b", expected: "google/gemma-4-31b-it" },
    { ollamaName: "granite4.2:8b", expected: "ibm-granite/granite-4.2-8b" },
    { ollamaName: "muse-glimmer:30b", expected: "meta-models/Muse-Glimmer-30B" },
    { ollamaName: "gpt-oss:20b", expected: "openai/gpt-oss-20b" },
    {
      // Ollama's tag is "26b"; HF keeps the MoE marker. Only the sibling tags
      // reveal "26b-a4b", so this case proves the mining works.
      ollamaName: "gemma4:26b",
      expected: "google/gemma-4-26b-a4b-it",
      siblingTags: ["26b-a4b-it-q8_0", "26b-mlx", "26b-a4b-it-qat"],
    },
  ];

  for (const { ollamaName, expected, siblingTags } of cases) {
    it(`resolves ${ollamaName} within the guess budget`, () => {
      const guesses = inferHfModelIds(ollamaName, siblingTags ?? []);
      expect(guesses).toContain(expected);
      expect(guesses.indexOf(expected)).toBeLessThan(MAX_HF_GUESSES);
    });
  }

  it("gives up on publishers it has no convention for", () => {
    expect(inferHfModelIds("some-unknown-model:7b")).toEqual([]);
  });

  it("gives up when the tag carries no size", () => {
    expect(inferHfModelIds("gemma4")).toEqual([]);
  });

  it("is deterministic, so reruns don't churn the diff", () => {
    expect(inferHfModelIds("gemma4:12b")).toEqual(inferHfModelIds("gemma4:12b"));
  });
});
