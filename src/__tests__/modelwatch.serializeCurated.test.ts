import { readFileSync } from "fs";
import { join } from "path";
import { curatedModels } from "@/lib/catalog/curated";
import { applyProposals, idFor, serializeCurated } from "@/lib/modelwatch/serializeCurated";
import type { Candidate, Judgement, Proposal } from "@/lib/modelwatch/types";

const CURATED_PATH = join(__dirname, "../lib/catalog/data/curated.json");

function candidate(over: Partial<Candidate> = {}): Candidate {
  return {
    ollamaName: "qwen3.7:27b",
    family: "qwen3.7",
    weightsGB: 18,
    residentGB: 18.5,
    visionCapable: true,
    pulls: 5_000_000,
    parametersB: 27,
    hfModelId: "Qwen/Qwen3.7-27B",
    hfDownloads: 2_000_000,
    ramRequiredGB: 27,
    fitsTier: 32,
    ...over,
  };
}

describe("serializeCurated", () => {
  it("reproduces the committed curated.json byte for byte", () => {
    // The idempotency guard. If the serializer and the committed file ever
    // disagree on formatting, every scheduled run rewrites the whole file and
    // the diff stops showing what actually changed.
    expect(serializeCurated(curatedModels)).toBe(readFileSync(CURATED_PATH, "utf-8"));
  });

  it("is stable regardless of input order", () => {
    const shuffled = [...curatedModels].reverse();
    expect(serializeCurated(shuffled)).toBe(serializeCurated(curatedModels));
  });

  it("preserves fields it doesn't know about", () => {
    const withExtra = [
      { ...curatedModels[0], someFutureField: "keep me" } as never,
    ];
    expect(serializeCurated(withExtra)).toContain("someFutureField");
  });
});

describe("idFor", () => {
  it("makes a stable slug from an Ollama tag", () => {
    expect(idFor("qwen3.6:35b-a3b")).toBe("qwen3.6-35b-a3b");
    expect(idFor("gemma4:12b")).toBe("gemma4-12b");
  });
});

describe("applyProposals", () => {
  const judgement: Judgement = {
    ollamaName: "qwen3.7:27b",
    include: true,
    isBeginnerChatModel: true,
    displayName: "Qwen3.7 27B",
    provider: "Alibaba",
    description: "A newer release.",
    bestFor: ["General chat"],
    quality: "excellent",
    speed: "medium",
    confidence: "high",
    reason: "newer",
  };
  const judgementFor = (name: string) => (name === judgement.ollamaName ? judgement : null);

  const proposal: Proposal = {
    kind: "retarget-tier",
    tier: 32,
    incumbentId: "qwen3.6-27b",
    candidate: candidate(),
    risk: "low",
    reasons: [],
  };

  it("moves tier ownership to the new model", () => {
    const next = applyProposals(curatedModels, [proposal], judgementFor, "2026-10-01");
    const owners = next.filter((m) => m.recommendedForRamGB === 32);
    expect(owners).toHaveLength(1);
    expect(owners[0].ollamaName).toBe("qwen3.7:27b");
    expect(owners[0].weightsGB).toBe(18.5);
    expect(owners[0].curatedAt).toBe("2026-10-01");
  });

  it("keeps the displaced model as an un-featured alternate", () => {
    const next = applyProposals(curatedModels, [proposal], judgementFor, "2026-10-01");
    const old = next.find((m) => m.id === "qwen3.6-27b")!;
    expect(old).toBeDefined();
    expect(old.featured).toBeUndefined();
    expect(old.recommendedForRamGB).toBeUndefined();
  });

  it("ignores blocked proposals entirely", () => {
    const next = applyProposals(
      curatedModels,
      [{ ...proposal, risk: "blocked" }],
      judgementFor,
      "2026-10-01"
    );
    expect(serializeCurated(next)).toBe(serializeCurated(curatedModels));
  });

  it("falls back to template copy when nothing judged the model", () => {
    const next = applyProposals(curatedModels, [proposal], () => null, "2026-10-01");
    const added = next.find((m) => m.ollamaName === "qwen3.7:27b")!;
    expect(added.description).toContain("27B model");
    expect(added.name).toBe("qwen3.7:27b");
  });

  it("carries MoE active parameters through", () => {
    const moe: Proposal = {
      ...proposal,
      tier: 64,
      incumbentId: "qwen3.6-35b-a3b",
      candidate: candidate({
        ollamaName: "qwen3.7:35b",
        family: "qwen3.7",
        parametersB: 35,
        activeParametersB: 3,
        residentGB: 24,
        ramRequiredGB: 33,
        fitsTier: 64,
      }),
    };
    const next = applyProposals(curatedModels, [moe], () => null, "2026-10-01");
    expect(next.find((m) => m.ollamaName === "qwen3.7:35b")!.activeParametersB).toBe(3);
  });
});
