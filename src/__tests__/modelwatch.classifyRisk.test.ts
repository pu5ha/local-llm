import { classifyProposal, overallRisk, type RiskContext } from "@/lib/modelwatch/classifyRisk";
import { heldBackReasons, lineage, sizeClass } from "@/lib/modelwatch/shortlist";
import type { Candidate, Judgement, Proposal } from "@/lib/modelwatch/types";
import type { CuratedModel } from "@/lib/catalog/types";

const incumbent: CuratedModel = {
  id: "qwen3.6-27b",
  ollamaName: "qwen3.6:27b",
  hfModelId: "Qwen/Qwen3.6-27B",
  name: "Qwen3.6 27B",
  provider: "Alibaba",
  description: "d",
  bestFor: ["General chat"],
  quality: "excellent",
  speed: "medium",
  featured: true,
  recommendedForRamGB: 32,
  curatedAt: "2026-09-21",
  parametersB: 27,
  weightsGB: 17.77,
  visionCapable: true,
};

function candidate(over: Partial<Candidate> = {}): Candidate {
  return {
    ollamaName: "qwen3.7:27b",
    family: "qwen3.7",
    weightsGB: 18.5,
    residentGB: 19,
    visionCapable: true,
    pulls: 5_000_000,
    parametersB: 27,
    hfModelId: "Qwen/Qwen3.7-27B",
    hfDownloads: 2_000_000,
    license: "apache-2.0",
    ramRequiredGB: 27,
    fitsTier: 32,
    ...over,
  };
}

function proposal(over: Partial<Proposal> = {}): Proposal {
  return {
    kind: "retarget-tier",
    tier: 32,
    incumbentId: "qwen3.6-27b",
    candidate: candidate(),
    risk: "review",
    reasons: [],
    ...over,
  };
}

const goodJudgement: Judgement = {
  ollamaName: "qwen3.7:27b",
  include: true,
  isBeginnerChatModel: true,
  displayName: "Qwen3.7 27B",
  provider: "Alibaba",
  description: "d",
  bestFor: ["General chat"],
  quality: "excellent",
  speed: "medium",
  confidence: "high",
  reason: "r",
};

function ctx(over: Partial<RiskContext> = {}): RiskContext {
  return {
    status: "ok",
    judged: true,
    judgementFor: () => goodJudgement,
    incumbentFor: (id) => (id === "qwen3.6-27b" ? incumbent : null),
    // Both models released on the same day unless a test says otherwise.
    releaseDateFor: () => "2026-08-01T00:00:00.000Z",
    ...over,
  };
}

describe("classifyProposal", () => {
  it("auto-commits a routine version bump in the same family and size class", () => {
    // This is the one case the owner signed off on for auto-merge:
    // qwen3.6:27b -> qwen3.7:27b.
    expect(classifyProposal(proposal(), ctx()).risk).toBe("low");
  });

  it("requires review when a higher version number was released earlier", () => {
    // Version numbers are not a reliable ordering: publishers maintain several
    // lines at once. Release date decides, and it comes from Hugging Face —
    // Ollama's "Updated" text moves when the packaging is refreshed, which had
    // qwen3.6 looking newer than a qwen3.8 released four months later.
    const result = classifyProposal(
      proposal(),
      ctx({
        releaseDateFor: (name: string) =>
          name.startsWith("qwen3.7") ? "2026-04-01T00:00:00.000Z" : "2026-08-01T00:00:00.000Z",
      })
    );
    expect(result.risk).toBe("review");
    expect(result.reasons.join(" ")).toMatch(/released before/);
  });

  it("auto-commits a bump that really is newer", () => {
    const result = classifyProposal(
      proposal(),
      ctx({
        releaseDateFor: (name: string) =>
          name.startsWith("qwen3.7") ? "2026-08-01T00:00:00.000Z" : "2026-04-01T00:00:00.000Z",
      })
    );
    expect(result.risk).toBe("low");
  });

  it("requires review when the family changes", () => {
    const result = classifyProposal(
      proposal({ candidate: candidate({ ollamaName: "gemma5:27b", family: "gemma5" }) }),
      ctx()
    );
    expect(result.risk).toBe("review");
    expect(result.reasons.join(" ")).toMatch(/switches family/);
  });

  it("requires review when the size class changes", () => {
    const result = classifyProposal(
      proposal({ candidate: candidate({ parametersB: 14 }) }),
      ctx()
    );
    expect(result.risk).toBe("review");
    expect(result.reasons.join(" ")).toMatch(/size class/);
  });

  it("requires review when swapping dense for Mixture-of-Experts", () => {
    const result = classifyProposal(
      proposal({ candidate: candidate({ activeParametersB: 3 }) }),
      ctx()
    );
    expect(result.risk).toBe("review");
    expect(result.reasons.join(" ")).toMatch(/dense and a Mixture-of-Experts/);
  });

  it("requires review when filling a previously empty tier", () => {
    const result = classifyProposal(
      proposal({ kind: "add-model", incumbentId: null }),
      ctx({ incumbentFor: () => null })
    );
    expect(result.risk).toBe("review");
  });

  it("never auto-commits without an API key to vet the model", () => {
    // No key means nothing judged suitability and nothing wrote the copy, so
    // there is no basis for autonomy.
    const result = classifyProposal(proposal(), ctx({ judged: false, judgementFor: () => null }));
    expect(result.risk).toBe("review");
    expect(result.reasons.join(" ")).toMatch(/GEMINI_API_KEY/);
  });

  it("never auto-commits from a degraded run", () => {
    expect(classifyProposal(proposal(), ctx({ status: "degraded" })).risk).toBe("review");
  });

  it("requires review when the reviewer was not confident", () => {
    const result = classifyProposal(
      proposal(),
      ctx({ judgementFor: () => ({ ...goodJudgement, confidence: "low" }) })
    );
    expect(result.risk).toBe("review");
  });

  it("requires review when the reviewer flagged a poor beginner experience", () => {
    const result = classifyProposal(
      proposal(),
      ctx({ judgementFor: () => ({ ...goodJudgement, isBeginnerChatModel: false }) })
    );
    expect(result.risk).toBe("review");
  });

  it("requires review for a license off the allowlist", () => {
    const result = classifyProposal(
      proposal({ candidate: candidate({ license: "some-custom-research-license" }) }),
      ctx()
    );
    expect(result.risk).toBe("review");
    expect(result.reasons.join(" ")).toMatch(/allowlist/);
  });

  it("blocks a model that does not fit the tier it was proposed for", () => {
    const result = classifyProposal(
      proposal({ candidate: candidate({ ramRequiredGB: 40, fitsTier: 64 }) }),
      ctx()
    );
    expect(result.risk).toBe("blocked");
  });

  it("does not treat a same-size successor as a downgrade", () => {
    // 17.74GB vs 17.77GB is 30MB, not a regression.
    expect(
      classifyProposal(proposal({ candidate: candidate({ residentGB: 17.74 }) }), ctx()).risk
    ).not.toBe("blocked");
  });

  it("blocks a downgrade", () => {
    // Never offer, not even as a PR: this would make the tier's advice worse.
    const result = classifyProposal(
      proposal({ candidate: candidate({ residentGB: 10, weightsGB: 9.5 }) }),
      ctx()
    );
    expect(result.risk).toBe("blocked");
    expect(result.reasons.join(" ")).toMatch(/meaningfully smaller than the model/);
  });

  it("blocks a candidate with no verified Hugging Face id", () => {
    const result = classifyProposal(
      proposal({ candidate: candidate({ hfModelId: null }) }),
      ctx()
    );
    expect(result.risk).toBe("blocked");
  });
});

describe("overallRisk", () => {
  it("is low for a single routine change", () => {
    expect(overallRisk([proposal({ risk: "low" })])).toBe("low");
  });

  it("is low when nothing is proposed", () => {
    expect(overallRisk([])).toBe("low");
  });

  it("escalates when more than one tier moves at once", () => {
    // Several tiers shifting in one week means something changed broadly
    // upstream; a person should see that before readers do.
    expect(
      overallRisk([
        proposal({ risk: "low", tier: 16 }),
        proposal({ risk: "low", tier: 32 }),
      ])
    ).toBe("review");
  });

  it("takes the worst risk across proposals", () => {
    expect(overallRisk([proposal({ risk: "low" }), proposal({ risk: "review" })])).toBe("review");
  });

  it("reports blocked when every proposal is blocked", () => {
    expect(overallRisk([proposal({ risk: "blocked" })])).toBe("blocked");
  });
});

describe("heldBackReasons", () => {
  it("holds back a model with no adoption yet", () => {
    const reasons = heldBackReasons(candidate({ hfDownloads: 40 }), incumbent);
    expect(reasons.join(" ")).toMatch(/Hugging Face downloads/);
  });

  it("holds back a different-family model that is not a clear step up", () => {
    const reasons = heldBackReasons(
      candidate({ ollamaName: "gemma5:27b", family: "gemma5", residentGB: 17.8 }),
      incumbent
    );
    expect(reasons.join(" ")).toMatch(/not a clear step up/);
  });

  it("exempts a newer release in the same lineage from the size margin", () => {
    // A successor is normally the SAME size as what it replaces, so requiring
    // it to be bigger would make the routine version bump unreachable — and
    // that is the one case cleared for auto-merge.
    expect(heldBackReasons(candidate({ residentGB: 17.74 }), incumbent)).toEqual([]);
  });

  it("still requires a real step up from an older release in the same lineage", () => {
    const reasons = heldBackReasons(
      candidate({ ollamaName: "qwen3.5:27b", family: "qwen3.5", residentGB: 17.8 }),
      incumbent
    );
    expect(reasons.join(" ")).toMatch(/older release than the current pick/);
  });

  it("demands a bigger margin when a swap would cost image support", () => {
    // Pasting in a screenshot is one of the few features a non-technical
    // reader notices immediately; a 12% size gain does not pay for losing it.
    const reasons = heldBackReasons(
      candidate({
        ollamaName: "gemma5:31b",
        family: "gemma5",
        residentGB: 19.87,
        visionCapable: false,
      }),
      incumbent
    );
    expect(reasons.join(" ")).toMatch(/would lose image support/);
  });

  it("holds back the current pick against itself", () => {
    const reasons = heldBackReasons(
      candidate({ ollamaName: "qwen3.6:27b", residentGB: 17.77 }),
      incumbent
    );
    expect(reasons.join(" ")).toMatch(/already the current pick/);
  });

  it("holds back a model too big for any tier", () => {
    const reasons = heldBackReasons(candidate({ fitsTier: null }), incumbent);
    expect(reasons.join(" ")).toMatch(/too large for any tier/);
  });

  it("passes a genuine upgrade", () => {
    expect(heldBackReasons(candidate(), incumbent)).toEqual([]);
  });
});

describe("lineage", () => {
  it("strips the version so a new release is the same lineage", () => {
    // The distinction the auto-merge rule depends on: a new release arrives as
    // a new FAMILY name, so only lineage can tell a version bump from a switch.
    expect(lineage("qwen3.6:27b")).toBe("qwen");
    expect(lineage("qwen3.7:27b")).toBe("qwen");
    expect(lineage("gemma4:12b")).toBe("gemma");
    expect(lineage("gemma5:12b")).toBe("gemma");
    expect(lineage("muse-glimmer:30b")).toBe("muse-glimmer");
    expect(lineage("gpt-oss:20b")).toBe("gpt-oss");
  });

  it("separates genuinely different lineages", () => {
    expect(lineage("qwen3.6:27b")).not.toBe(lineage("gemma4:12b"));
  });
});

describe("sizeClass", () => {
  it("buckets by what a machine can hold, not exact params", () => {
    expect(sizeClass(27)).toBe(sizeClass(30));
    expect(sizeClass(4)).not.toBe(sizeClass(12));
    expect(sizeClass(12)).not.toBe(sizeClass(27));
  });
});
