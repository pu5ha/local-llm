"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Wifi,
  Image as ImageIcon,
  Eye,
  Infinity,
  Check,
  Cpu,
} from "lucide-react";
import useHardwareDetection from "@/hooks/useHardwareDetection";

export default function ImagesPage() {
  const { hardware, imageRecommendations } = useHardwareDetection();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Stamp Badge */}
            <div className="stamp mx-auto mb-8">
              <Lock className="w-4 h-4" />
              100% Private &amp; Local
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
              Create images with AI —{" "}
              <span className="highlight-underline">100% private</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              Turn your descriptions into images, all on your own computer.
              Your images are created locally — nothing is uploaded, no one sees what you make.
            </p>

            <Link href="/images/setup" className="btn-primary">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What is this section */}
      <section className="py-16 md:py-20 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-4">
              What is AI image generation?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              You describe what you want to see in words, and the AI creates an image from your description.
              It&apos;s like having an artist who can paint anything you can imagine.
            </p>
          </motion.div>

          {/* Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="paper-card p-6 md:p-8"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-sm text-muted mb-2">You type:</div>
                <div className="bg-background-alt rounded-lg p-4 font-mono text-sm mb-4">
                  &quot;A cozy coffee shop on a rainy day, warm lighting, plants in the window, watercolor painting style&quot;
                </div>
                <div className="text-sm text-muted">
                  The AI understands your description and creates a unique image that matches it.
                  Every generation is different — you can create unlimited variations.
                </div>
              </div>
              <div className="bg-background-alt rounded-lg p-8 text-center">
                <ImageIcon className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted">
                  Your generated image appears here
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why local section */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Why create images locally?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Online AI image tools see everything you create.
              Running locally means complete privacy and freedom.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Eye,
                title: "Complete Privacy",
                description:
                  "Your images never leave your computer. Create anything without worry.",
              },
              {
                icon: Lock,
                title: "No Watermarks",
                description:
                  "Your images are yours. No forced watermarks or branding.",
              },
              {
                icon: Infinity,
                title: "Unlimited Generations",
                description:
                  "No credits to buy, no subscriptions. Generate as many images as you want.",
              },
              {
                icon: Wifi,
                title: "Works Offline",
                description:
                  "Once set up, you can create images without an internet connection.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="paper-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-pale flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Check Summary */}
      <section className="py-16 md:py-20 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="paper-card p-6 md:p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-pale flex items-center justify-center flex-shrink-0">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-1">Can your computer create AI images?</h3>
                <p className="text-muted text-sm">
                  Image generation needs a graphics card (GPU) with its own memory.
                </p>
              </div>
            </div>

            {hardware.isLoading ? (
              <div className="bg-background-alt rounded-lg p-6 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-muted">Checking your hardware...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* GPU Info - Apple Silicon vs others */}
                <div className="bg-background-alt rounded-lg p-4">
                  {hardware.isAppleSilicon || hardware.gpuType === "apple" ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Chip</span>
                        <span className="font-medium">Apple Silicon (M-series)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Memory available for images</span>
                        <span className="font-medium">~{hardware.estimatedVram || 12}GB</span>
                      </div>
                      <p className="text-xs text-muted mt-2">
                        Your Mac&apos;s RAM is shared between CPU and GPU — no separate graphics card needed.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Graphics Card</span>
                        <span className="font-medium">
                          {hardware.gpu
                            ? hardware.gpu.length > 40
                              ? hardware.gpu.substring(0, 40) + "..."
                              : hardware.gpu
                            : "Not detected"}
                        </span>
                      </div>
                      {hardware.estimatedVram && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Graphics Memory (VRAM)</span>
                          <span className="font-medium">{hardware.estimatedVram}GB</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Recommendation */}
                {imageRecommendations.canRun ? (
                  <div className="bg-primary-pale rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">
                        Yes! You can create AI images
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      {imageRecommendations.tierDescription}
                    </p>
                    {imageRecommendations.recommendedModels.length > 0 && (
                      <p className="text-sm text-muted mt-2">
                        <strong>Recommended:</strong>{" "}
                        {imageRecommendations.recommendedModels.join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      We couldn&apos;t detect a compatible graphics card, but you might still be able to create images.
                      Start the setup to learn more.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <Link href="/images/setup" className="btn-primary w-full justify-center">
                Start Setup
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What you'll need */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              What you&apos;ll need
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "A Compatible Computer",
                subtitle: "Mac with M-chip, or PC with graphics card",
                description:
                  "Macs with Apple Silicon work great. PCs need an NVIDIA or AMD graphics card.",
                requirement: "8GB+ RAM (Mac) or 4GB+ VRAM (PC)",
              },
              {
                title: "Some Disk Space",
                subtitle: "For the software and AI models",
                description:
                  "You'll need space for the image generation software and at least one AI model.",
                requirement: "10-20GB free space",
              },
              {
                title: "A Few Minutes",
                subtitle: "To download and set up",
                description:
                  "We'll guide you through downloading the software and getting your first image.",
                requirement: "One-time setup",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="paper-card p-6"
              >
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-primary mb-3">{item.subtitle}</p>
                <p className="text-sm text-muted mb-4">{item.description}</p>
                <div className="tag tag-green text-xs">{item.requirement}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">
              Ready to create your first image?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              We&apos;ll walk you through checking your computer, choosing a tool,
              and generating your first AI image.
            </p>
            <Link
              href="/images/setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded-lg hover:bg-primary-pale transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              Start Setup
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-terminal-green" />
                No account needed
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-terminal-green" />
                Completely free
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
