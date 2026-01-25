"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Wifi, DollarSign, Check, Monitor } from "lucide-react";
import UseCaseSelector from "@/components/UseCaseSelector";
import { getAllTiers } from "@/data/tiers";

export default function Home() {
  const tiers = getAllTiers();

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
              <Shield className="w-4 h-4" />
              100% Private & Local
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
              Your AI. Your computer.{" "}
              <span className="highlight-underline">Your privacy.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-12 max-w-2xl mx-auto">
              Run AI on your own machine—no data sent to the cloud, no subscriptions,
              no limits. We'll help you figure out what your computer can handle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Use Case Section - THE MAIN CTA */}
      <section className="py-16 md:py-20 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              What do you want to do with AI?
            </h2>
            <p className="text-muted">
              Click one to see if your computer can handle it
            </p>
          </motion.div>

          <UseCaseSelector />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              href="/computers"
              className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              <Monitor className="w-4 h-4" />
              Or check what your computer can run
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Tier Overview */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Not all computers are equal
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Different computers can run different AI models. Here's a quick overview—
              we'll help you figure out exactly where you stand.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="paper-card p-6 text-center"
              >
                <div className="text-3xl mb-3">{tier.emoji}</div>
                <h3 className="font-serif text-xl mb-2">{tier.name} Tier</h3>
                <p className="text-sm text-muted mb-4">{tier.tagline}</p>
                <div className="text-xs text-muted bg-background-alt rounded-lg py-2 px-3">
                  {tier.exampleComputers[0]}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/computers" className="btn-primary">
              Check My Computer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Local Section */}
      <section className="py-16 md:py-20 bg-background-alt">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Why run AI locally?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Every message you send to ChatGPT goes to OpenAI's servers.
              There's a better way.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Total Privacy",
                description:
                  "Your conversations never leave your machine. No one can read them—not even us.",
              },
              {
                icon: Wifi,
                title: "Works Offline",
                description:
                  "No internet required. Use AI on airplanes, in remote areas, or anywhere.",
              },
              {
                icon: DollarSign,
                title: "Free Forever",
                description:
                  "No $20/month subscription. No API costs. Download once, use unlimited.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
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

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="tag tag-green mb-4">Simple Process</span>
            <h2 className="font-serif text-2xl sm:text-3xl">
              Up and running in minutes
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Check your computer",
                desc: "We'll detect your specs and tell you exactly what you can run.",
              },
              {
                num: 2,
                title: "Pick what you want to do",
                desc: "Chat? Code? Write? We'll recommend the right setup for you.",
              },
              {
                num: 3,
                title: "Follow our guide",
                desc: "Step-by-step instructions. Copy-paste commands. No experience needed.",
              },
              {
                num: 4,
                title: "Start using private AI",
                desc: "That's it. Your conversations now stay on your computer.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="step-number flex-shrink-0">{step.num}</div>
                <div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-muted">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/computers" className="btn-primary">
              Let's Check Your Computer
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              Find out what your computer can handle, then follow our simple guide
              to get started. No tech expertise required.
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

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="6" fill="#1a5f4a" />
                <path d="M10 16h12M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="10" cy="10" r="2" fill="#c9a227" />
                <circle cx="22" cy="22" r="2" fill="#c9a227" />
              </svg>
              <span className="font-serif">
                Local<span className="text-primary font-semibold">LLM</span>
              </span>
            </div>
            <p className="text-sm text-muted">
              Made for people who value their privacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
