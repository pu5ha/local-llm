"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  Wifi,
  WifiOff,
  DollarSign,
  Zap,
  Eye,
  EyeOff,
  Server,
  Laptop,
  Cloud,
  CloudOff,
  Check,
  X,
} from "lucide-react";

export default function WhyPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stamp mx-auto mb-8">
              <Shield className="w-4 h-4" />
              Take Back Control
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
              Why run AI{" "}
              <span className="highlight-underline">on your computer?</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
              Every time you use ChatGPT, Claude, or Gemini, your conversations
              go to their servers. There's a better way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              The problem with cloud AI
            </h2>
            <p className="text-muted">
              When you use online AI services, here's what happens:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="paper-card p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-background-alt flex items-center justify-center mx-auto mb-3">
                  <Laptop className="w-8 h-8" />
                </div>
                <p className="font-medium">You type a message</p>
              </div>

              <div className="flex items-center gap-2 text-muted">
                <ArrowRight className="w-5 h-5" />
                <Cloud className="w-5 h-5" />
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <Server className="w-8 h-8 text-red-600" />
                </div>
                <p className="font-medium">Sent to their servers</p>
              </div>

              <div className="flex items-center gap-2 text-muted">
                <Eye className="w-5 h-5" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-8 h-8 text-red-600" />
                </div>
                <p className="font-medium">Stored & analyzed</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-red-800">
                <strong>Your private thoughts, work documents, and personal questions</strong>
                <br />
                <span className="text-red-600">are now on someone else's computer.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              The local AI difference
            </h2>
            <p className="text-muted">
              When you run AI on your own computer:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="paper-card p-8 border-2 border-primary"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-background-alt flex items-center justify-center mx-auto mb-3">
                  <Laptop className="w-8 h-8" />
                </div>
                <p className="font-medium">You type a message</p>
              </div>

              <div className="flex items-center gap-2 text-muted">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-3">
                  <Laptop className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium">Processed locally</p>
              </div>

              <div className="flex items-center gap-2 text-muted">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium">Stays on your device</p>
              </div>
            </div>

            <div className="bg-primary-pale rounded-xl p-4 text-center">
              <p className="text-primary">
                <strong>Your data never leaves your computer.</strong>
                <br />
                <span className="text-primary/80">No servers. No cloud. No one watching.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-background-alt">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              The benefits of local AI
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: EyeOff,
                title: "Complete Privacy",
                description:
                  "Your conversations, documents, and ideas stay on your computer. No one can read them—not the AI company, not hackers, not anyone.",
                color: "primary",
              },
              {
                icon: WifiOff,
                title: "Works Offline",
                description:
                  "Use AI on airplanes, in remote areas, during internet outages, or anywhere without WiFi. Your AI is always available.",
                color: "primary",
              },
              {
                icon: DollarSign,
                title: "Free Forever",
                description:
                  "No $20/month ChatGPT Plus subscription. No API costs that add up. Download once, use unlimited forever.",
                color: "secondary",
              },
              {
                icon: Zap,
                title: "No Rate Limits",
                description:
                  "Never see \"You've reached your limit\" again. Ask as many questions as you want, whenever you want.",
                color: "secondary",
              },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="paper-card p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    benefit.color === "primary"
                      ? "bg-primary-pale"
                      : "bg-secondary-pale"
                  }`}
                >
                  <benefit.icon
                    className={`w-6 h-6 ${
                      benefit.color === "primary"
                        ? "text-primary"
                        : "text-secondary"
                    }`}
                  />
                </div>
                <h3 className="font-serif text-xl mb-2">{benefit.title}</h3>
                <p className="text-muted">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Cloud AI vs Local AI
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="paper-card overflow-hidden"
          >
            <div className="grid grid-cols-3 text-center">
              <div className="p-4 bg-background-alt font-medium border-b border-border">
                Feature
              </div>
              <div className="p-4 bg-red-50 font-medium border-b border-border text-red-700">
                <Cloud className="w-5 h-5 inline mr-2" />
                Cloud AI
              </div>
              <div className="p-4 bg-primary-pale font-medium border-b border-border text-primary">
                <Laptop className="w-5 h-5 inline mr-2" />
                Local AI
              </div>

              {[
                { feature: "Privacy", cloud: false, local: true },
                { feature: "Works Offline", cloud: false, local: true },
                { feature: "Monthly Cost", cloud: "$20+/mo", local: "Free" },
                { feature: "Rate Limits", cloud: "Yes", local: "None" },
                { feature: "Data Ownership", cloud: "Theirs", local: "Yours" },
                { feature: "Internet Required", cloud: "Always", local: "Never" },
              ].map((row, i) => (
                <>
                  <div
                    key={`feature-${i}`}
                    className="p-4 border-b border-border text-sm font-medium"
                  >
                    {row.feature}
                  </div>
                  <div
                    key={`cloud-${i}`}
                    className="p-4 border-b border-border text-sm"
                  >
                    {typeof row.cloud === "boolean" ? (
                      row.cloud ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-red-600">{row.cloud}</span>
                    )}
                  </div>
                  <div
                    key={`local-${i}`}
                    className="p-4 border-b border-border text-sm"
                  >
                    {typeof row.local === "boolean" ? (
                      row.local ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-primary font-medium">{row.local}</span>
                    )}
                  </div>
                </>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-16 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Who should run local AI?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                emoji: "👩‍💼",
                title: "Professionals",
                desc: "Keep client data, business strategies, and sensitive documents private.",
              },
              {
                emoji: "👨‍💻",
                title: "Developers",
                desc: "Get coding help without sharing proprietary code with external services.",
              },
              {
                emoji: "✍️",
                title: "Writers & Creatives",
                desc: "Brainstorm and create without your ideas being stored on corporate servers.",
              },
              {
                emoji: "🔒",
                title: "Privacy-Conscious Users",
                desc: "Anyone who values keeping their digital life private.",
              },
              {
                emoji: "✈️",
                title: "Frequent Travelers",
                desc: "Use AI on planes, trains, and anywhere without reliable internet.",
              },
              {
                emoji: "💰",
                title: "Budget-Conscious Users",
                desc: "Skip the monthly subscriptions and API fees entirely.",
              },
            ].map((persona, i) => (
              <motion.div
                key={persona.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 paper-card"
              >
                <span className="text-3xl">{persona.emoji}</span>
                <div>
                  <h4 className="font-semibold mb-1">{persona.title}</h4>
                  <p className="text-sm text-muted">{persona.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">
              Ready to take back your privacy?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Find out if your computer can run local AI, then follow our simple
              guide to get started.
            </p>
            <Link
              href="/computers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded-lg hover:bg-primary-pale transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              Check My Computer
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
