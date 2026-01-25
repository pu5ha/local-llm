"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  Monitor,
  Cpu,
  HardDrive,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAllTiers, getTierForRam, getTierById, TierId } from "@/data/tiers";
import { getUseCaseById, UseCaseId } from "@/data/useCases";
import useHardwareDetection from "@/hooks/useHardwareDetection";

function ComputersPageContent() {
  const searchParams = useSearchParams();
  const useCaseParam = searchParams.get("use") as UseCaseId | null;
  const useCase = useCaseParam ? getUseCaseById(useCaseParam) : null;

  const { hardware, recommendations } = useHardwareDetection();
  const tiers = getAllTiers();

  const [userTier, setUserTier] = useState<TierId | null>(null);
  const [expandedSection, setExpandedSection] = useState<"upgrade" | "buy" | null>(null);

  // Track if user has manually selected RAM (browser detection is unreliable)
  const [manualRamSelected, setManualRamSelected] = useState<number | null>(null);

  const detectedTier = userTier ? getTierById(userTier) : null;

  // Check if user can run the selected use case
  const canRunUseCase = useCase && detectedTier
    ? getTierRank(detectedTier.id) >= getTierRank(useCase.minimumTier)
    : true;

  function getTierRank(tierId: TierId): number {
    const ranks = { entry: 1, standard: 2, power: 3 };
    return ranks[tierId];
  }

  function getOSLabel(os: string): string {
    const labels: Record<string, string> = {
      mac: "Mac",
      windows: "Windows",
      linux: "Linux",
      unknown: "Unknown",
    };
    return labels[os] || os;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {useCase ? (
              <>
                <div className="inline-flex items-center gap-2 text-sm text-muted mb-4">
                  <span className="text-2xl">{useCase.emoji}</span>
                  You want to: <strong>{useCase.name}</strong>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
                  Can your computer handle it?
                </h1>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                  {useCase.name} requires at least a{" "}
                  <span className="font-medium text-foreground">
                    {getTierById(useCase.minimumTier).emoji} {getTierById(useCase.minimumTier).name} tier
                  </span>{" "}
                  computer. Let's see what you've got.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
                  What can your computer run?
                </h1>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                  Different computers can handle different AI capabilities.
                  Let's find out what yours can do.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Hardware Detection Card */}
      <section className="pb-12">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="paper-card overflow-hidden"
          >
            {/* Detection Header */}
            <div className="bg-background-alt px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Your Computer</h2>
                  <p className="text-sm text-muted">
                    {hardware.isLoading
                      ? "Detecting hardware..."
                      : "Detected automatically"}
                  </p>
                </div>
              </div>
            </div>

            {/* Detection Results */}
            <div className="p-6">
              {hardware.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Specs Grid - OS and Cores only (RAM is unreliable) */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-lg bg-background-alt flex items-center justify-center mx-auto mb-2">
                        <Monitor className="w-5 h-5 text-muted" />
                      </div>
                      <div className="text-sm text-muted">System</div>
                      <div className="font-medium">
                        {getOSLabel(hardware.os)}
                        {hardware.osVersion && ` ${hardware.osVersion}`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-lg bg-background-alt flex items-center justify-center mx-auto mb-2">
                        <Cpu className="w-5 h-5 text-muted" />
                      </div>
                      <div className="text-sm text-muted">CPU Cores</div>
                      <div className="font-medium">
                        {hardware.cores || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* RAM Selection - Primary UI */}
                  {!manualRamSelected && (
                    <div className="mb-6">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <HardDrive className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            How much RAM does your computer have?
                          </p>
                          <p className="text-sm text-muted mt-1">
                            Follow the steps below to find out, then select your amount.
                          </p>
                        </div>
                      </div>

                      {/* Instructions - shown first */}
                      <div className="bg-background-alt rounded-xl p-4 mb-5">
                        {hardware.os === "mac" ? (
                          /* Mac Instructions */
                          <div>
                            <p className="font-medium mb-3">Find your RAM on Mac:</p>
                            <ol className="space-y-2 text-sm">
                              <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">1</span>
                                <span>Click the <strong>Apple logo </strong> in the top-left corner of your screen</span>
                              </li>
                              <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">2</span>
                                <span>Click <strong>"About This Mac"</strong></span>
                              </li>
                              <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">3</span>
                                <div>
                                  <span>Look for <strong>"Memory"</strong> — you'll see a number like:</span>
                                  <div className="mt-1 inline-block font-mono bg-white border border-border px-3 py-1 rounded text-sm">
                                    16 GB
                                  </div>
                                </div>
                              </li>
                            </ol>
                            <p className="text-xs text-muted mt-3">
                              The number before "GB" is your RAM (8, 16, 32, etc.)
                            </p>
                          </div>
                        ) : hardware.os === "windows" ? (
                          /* Windows Instructions */
                          <div>
                            <p className="font-medium mb-3">Find your RAM on Windows:</p>
                            <ol className="space-y-2 text-sm">
                              <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">1</span>
                                <span>Press <strong>Windows key + I</strong> to open Settings</span>
                              </li>
                              <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">2</span>
                                <span>Click <strong>"System"</strong>, then scroll down and click <strong>"About"</strong></span>
                              </li>
                              <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">3</span>
                                <div>
                                  <span>Look for <strong>"Installed RAM"</strong> — you'll see a number like:</span>
                                  <div className="mt-1 inline-block font-mono bg-white border border-border px-3 py-1 rounded text-sm">
                                    16.0 GB
                                  </div>
                                </div>
                              </li>
                            </ol>
                            <p className="text-xs text-muted mt-3">
                              Ignore decimals — 15.8 GB means you have 16GB
                            </p>
                          </div>
                        ) : (
                          /* Generic Instructions for Linux/Unknown */
                          <div>
                            <p className="font-medium mb-3">Find your RAM:</p>
                            <div className="space-y-3 text-sm">
                              <div className="bg-white rounded-lg p-3 border border-border">
                                <p className="font-medium text-sm mb-1">Mac:</p>
                                <p className="text-muted">Apple menu  → About This Mac → Look for "Memory"</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-border">
                                <p className="font-medium text-sm mb-1">Windows:</p>
                                <p className="text-muted">Settings → System → About → Look for "Installed RAM"</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-border">
                                <p className="font-medium text-sm mb-1">Linux:</p>
                                <p className="text-muted">Open terminal and run: <code className="bg-gray-100 px-1 rounded">free -h</code></p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* RAM Selection */}
                      <div className="bg-primary-pale rounded-xl p-4">
                        <p className="font-medium mb-3">Select your RAM:</p>
                        <div className="flex flex-wrap gap-2">
                          {[8, 16, 32, 64].map((ram) => {
                            const isSuggested = ram === hardware.suggestedRam;
                            return (
                              <button
                                key={ram}
                                onClick={() => {
                                  setManualRamSelected(ram);
                                  setUserTier(getTierForRam(ram));
                                }}
                                className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-colors ${
                                  isSuggested
                                    ? "border-primary bg-primary text-white hover:bg-primary/90"
                                    : "border-border bg-white hover:border-primary"
                                }`}
                              >
                                {ram}GB
                                {isSuggested && " (likely yours)"}
                              </button>
                            );
                          })}
                        </div>
                        {hardware.suggestedRam && (
                          <p className="text-xs text-muted mt-3">
                            Based on your {hardware.suggestedRamReason?.toLowerCase()}, you likely have {hardware.suggestedRam}GB
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tier Result - Only show after manual RAM selection */}
                  {manualRamSelected && detectedTier && (
                    <div
                      className={`rounded-xl p-6 ${
                        detectedTier.id === "entry"
                          ? "bg-primary-pale"
                          : detectedTier.id === "standard"
                          ? "bg-secondary-pale"
                          : "bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{detectedTier.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-xl">
                              You're in the {detectedTier.name} Tier
                            </h3>
                            <span className="text-xs bg-white/60 px-2 py-0.5 rounded">
                              {manualRamSelected}GB RAM
                            </span>
                          </div>
                          <p className="text-sm text-muted mb-4">
                            {detectedTier.tagline}
                          </p>

                          {/* Use case compatibility */}
                          {useCase && (
                            <div
                              className={`flex items-center gap-2 p-3 rounded-lg ${
                                canRunUseCase
                                  ? "bg-white/60 text-primary"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {canRunUseCase ? (
                                <>
                                  <Check className="w-5 h-5" />
                                  <span className="font-medium">
                                    Great news! You can run {useCase.name}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-5 h-5" />
                                  <span className="font-medium">
                                    {useCase.name} needs a{" "}
                                    {getTierById(useCase.minimumTier).name} tier computer
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {/* Quick capabilities */}
                          {!useCase && (
                            <ul className="space-y-1">
                              {detectedTier.capabilities.slice(0, 3).map((cap) => (
                                <li
                                  key={cap}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{cap}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Link
                          href={`/setup?tier=${detectedTier.id}&ram=${manualRamSelected}${useCase ? `&use=${useCase.id}` : ""}`}
                          className="btn-primary justify-center"
                        >
                          <Sparkles className="w-4 h-4" />
                          Get Started with {detectedTier.name} Tier
                        </Link>
                        {detectedTier.id !== "power" && (
                          <button
                            onClick={() => setExpandedSection(expandedSection === "upgrade" ? null : "upgrade")}
                            className="btn-secondary justify-center"
                          >
                            <Wrench className="w-4 h-4" />
                            Want more power?
                          </button>
                        )}
                      </div>

                      {/* Change selection link */}
                      <button
                        onClick={() => {
                          setManualRamSelected(null);
                          setUserTier(null);
                        }}
                        className="mt-4 text-sm text-muted hover:text-foreground transition-colors"
                      >
                        Change RAM selection
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upgrade Section */}
      <AnimatePresence>
        {expandedSection === "upgrade" && detectedTier && detectedTier.upgradeInfo && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pb-12"
          >
            <div className="max-w-2xl mx-auto px-6">
              <div className="paper-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary-pale flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-serif text-xl">Upgrade Your Current Computer</h3>
                </div>

                <div className="bg-background-alt rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-medium mb-1">{detectedTier.upgradeInfo.action}</p>
                      <p className="text-sm text-muted">
                        Estimated cost: <strong>{detectedTier.upgradeInfo.cost}</strong>
                      </p>
                      <p className="text-sm text-muted mt-2">
                        This would let you: {detectedTier.upgradeInfo.benefit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted">
                  <p className="mb-2"><strong>How to check if you can upgrade RAM:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Mac: Most modern Macs have soldered RAM (not upgradeable)</li>
                    <li>Windows laptop: Check your model on Crucial.com</li>
                    <li>Desktop PC: Almost always upgradeable</li>
                  </ul>
                </div>

                <button
                  onClick={() => setExpandedSection("buy")}
                  className="mt-4 text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Or see buying recommendations
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* All Tiers Comparison */}
      <section className="py-12 bg-background-alt">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              The Three Tiers Explained
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Not all computers are equal when it comes to running AI.
              Here's what each tier can do.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => {
              const isUserTier = userTier === tier.id;
              const colorClasses = {
                entry: { bg: "bg-primary-pale", border: "ring-primary", tag: "tag-green" },
                standard: { bg: "bg-secondary-pale", border: "ring-secondary", tag: "tag-amber" },
                power: { bg: "bg-blue-50", border: "ring-blue-500", tag: "bg-blue-100 text-blue-700" },
              };
              const colors = colorClasses[tier.id];

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`paper-card p-6 ${isUserTier ? `ring-2 ${colors.border}` : ""}`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{tier.emoji}</span>
                    <div>
                      <h3 className="font-serif text-xl">{tier.name} Tier</h3>
                      <p className="text-sm text-muted">{tier.tagline}</p>
                    </div>
                  </div>

                  {isUserTier && (
                    <div className={`tag ${colors.tag} mb-4`}>
                      ✓ Your computer
                    </div>
                  )}

                  {/* RAM Requirement */}
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <HardDrive className="w-4 h-4 text-muted" />
                    <span>
                      <strong>{tier.ramRequired}GB+</strong> RAM required
                    </span>
                  </div>

                  {/* Example Computers */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Example computers:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tier.exampleComputers.slice(0, 3).map((comp) => (
                        <span
                          key={comp}
                          className="text-xs bg-background-alt px-2 py-1 rounded"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">What you can do:</h4>
                    <ul className="space-y-1">
                      {tier.capabilities.slice(0, 4).map((cap) => (
                        <li key={cap} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {tier.limitations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Limitations:</h4>
                      <ul className="space-y-1">
                        {tier.limitations.slice(0, 2).map((lim) => (
                          <li key={lim} className="flex items-start gap-2 text-sm text-muted">
                            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  {isUserTier ? (
                    <Link
                      href={`/setup?tier=${tier.id}&ram=${manualRamSelected}`}
                      className="btn-primary w-full justify-center mt-4"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className={`mt-4 pt-4 border-t border-border text-sm ${colors.bg} -mx-6 -mb-6 px-6 pb-6 rounded-b-lg`}>
                      <strong>To reach this tier:</strong>
                      <p className="text-muted mt-1">
                        Need {tier.ramRequired}GB+ RAM
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Buying Guide Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary-pale flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Buying a New Computer?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Here's what to look for if you're shopping for a computer that can run AI locally.
            </p>
          </motion.div>

          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="paper-card p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <h3 className="font-semibold">{tier.name} Tier</h3>
                      <p className="text-sm text-muted">{tier.ramRequired}GB+ RAM</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold text-primary mb-1">
                      {tier.buyingGuide.priceRange}
                    </div>
                    <div className="text-sm text-muted">
                      {tier.buyingGuide.examples[0]}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const el = document.getElementById(`buying-${tier.id}`);
                      if (el) {
                        el.classList.toggle("hidden");
                      }
                    }}
                    className="btn-secondary text-sm"
                  >
                    <ChevronDown className="w-4 h-4" />
                    More options
                  </button>
                </div>

                <div id={`buying-${tier.id}`} className="hidden mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Recommended options:</h4>
                  <ul className="space-y-2">
                    {tier.buyingGuide.examples.map((example) => (
                      <li key={example} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-xs text-muted">
                    <strong>Key spec to look for:</strong> {tier.ramRequired}GB RAM or more
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-background-alt rounded-xl text-center">
            <p className="text-muted mb-4">
              <strong>Pro tip:</strong> RAM is the most important spec for running AI locally.
              A computer with 16GB RAM and a basic processor will outperform one with 8GB RAM
              and a fast processor for AI tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl md:text-3xl mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-400 mb-8">
              {detectedTier
                ? `Your ${detectedTier.name} tier computer is ready. Follow our simple setup guide.`
                : "Once you know your tier, follow our simple setup guide to start using private AI."}
            </p>
            <Link
              href={`/setup${userTier ? `?tier=${userTier}&ram=${manualRamSelected}` : ""}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded-lg hover:bg-primary-pale transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              Start Setup Guide
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Loading fallback for Suspense
function ComputersPageLoading() {
  return (
    <div className="min-h-screen pb-20">
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
            What can your computer run?
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Different computers can handle different AI capabilities.
            Let&apos;s find out what yours can do.
          </p>
        </div>
      </section>
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ComputersPage() {
  return (
    <Suspense fallback={<ComputersPageLoading />}>
      <ComputersPageContent />
    </Suspense>
  );
}
