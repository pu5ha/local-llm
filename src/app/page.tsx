"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Wifi, DollarSign, Check, Monitor, HelpCircle } from "lucide-react";
import UseCaseSelector from "@/components/UseCaseSelector";
import { getAllTiers } from "@/data/tiers";

export default function Home() {
  const tiers = getAllTiers();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Lead with the problem */}
      <section className="relative pt-24 pb-8 md:pt-32 md:pb-12 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-6">
              Did you know <span className="highlight-underline">everything you type into ChatGPT</span> is saved by OpenAI?
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              Every question you ask. Every personal detail you share. Every work document you paste in.
              It all gets sent to their computers, where it can be stored, read, and used to train future AI.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visual explanation of the problem */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="paper-card p-6 mb-6">
              <p className="font-medium mb-4 text-center">Here's what happens when you use ChatGPT:</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 bg-background-alt rounded-lg px-4 py-3 w-full sm:w-auto justify-center">
                  <span>You type a message</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted rotate-90 sm:rotate-0 flex-shrink-0" />
                <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 w-full sm:w-auto justify-center">
                  <span>Sent over the internet</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted rotate-90 sm:rotate-0 flex-shrink-0" />
                <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 w-full sm:w-auto justify-center">
                  <span>Stored on OpenAI's servers</span>
                </div>
              </div>
              <p className="text-sm text-muted text-center">
                This includes your private thoughts, medical questions, work secrets, relationship advice requests - everything.
              </p>
            </div>

            {/* The solution */}
            <div className="bg-primary-pale rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <p className="font-semibold text-primary">There's a better way</p>
              </div>
              <p className="text-lg mb-3">
                You can run AI <strong>directly on your own computer</strong> instead.
              </p>
              <p className="text-muted mb-4">
                It works just like ChatGPT - you type questions, it gives answers - but nothing ever leaves your device.
                No company can see what you ask. It's completely private.
              </p>
              <Link href="/computers" className="btn-primary inline-flex">
                Show Me How
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
              Pick one and we'll check if your computer can handle it
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
              Or just check what your computer can run
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits - More tangible */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Why does this matter?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Ask anything privately",
                description:
                  "Medical questions, relationship advice, financial worries, embarrassing questions - ask without anyone knowing.",
              },
              {
                icon: Shield,
                title: "Keep work confidential",
                description:
                  "Use AI with client data, business strategies, and sensitive documents without sending them to a third party.",
              },
              {
                icon: DollarSign,
                title: "Never pay again",
                description:
                  "No $20/month ChatGPT subscription. No usage limits. Download once, use forever, completely free.",
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

      {/* Quick Tier Overview - Simplified */}
      <section className="py-16 md:py-20 bg-background-alt">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-3">
              Will it work on my computer?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              It depends on your computer's memory (RAM). Here's a quick guide -
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
                <h3 className="font-serif text-xl mb-1">{tier.name}</h3>
                <div className="text-sm text-primary font-medium mb-2">
                  {tier.ramRequired}GB+ memory
                </div>
                <p className="text-sm text-muted mb-4">{tier.tagline}</p>
                <div className="text-xs text-muted bg-background rounded-lg py-2 px-3">
                  Example: {tier.exampleComputers[0]}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/computers" className="btn-primary">
              Check My Computer
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-muted mt-3">
              Don't know your computer's specs? We'll help you find out.
            </p>
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
              How to get started
            </h2>
            <p className="text-muted mt-3">
              Don't worry - we'll walk you through every single step
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Check your computer",
                desc: "We'll help you find out how much memory your computer has and what it can run.",
              },
              {
                num: 2,
                title: "Pick what you want to do",
                desc: "Chat? Write? Get coding help? We'll recommend the right setup for you.",
              },
              {
                num: 3,
                title: "Follow our step-by-step guide",
                desc: "We explain everything in plain English. You'll just copy and paste a few things - no tech skills needed.",
              },
              {
                num: 4,
                title: "Start chatting with your private AI",
                desc: "That's it! Your conversations now stay on your computer forever.",
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
              Let's Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reassurance Section */}
      <section className="py-16 md:py-20 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="paper-card p-8"
          >
            <h2 className="font-serif text-xl sm:text-2xl mb-6 text-center">
              You might be wondering...
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Do I need to be tech-savvy?</h3>
                <p className="text-sm text-muted">
                  Nope! If you can download an app and follow instructions, you can do this.
                  We explain everything like you've never done it before.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is this as good as ChatGPT?</h3>
                <p className="text-sm text-muted">
                  For everyday tasks, yes! These AI models are really capable.
                  The tradeoff is total privacy and no monthly fees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Will it slow down my computer?</h3>
                <p className="text-sm text-muted">
                  Only when you're actively chatting. When you're not using it,
                  it doesn't use any resources at all.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How much does it cost?</h3>
                <p className="text-sm text-muted">
                  Nothing! The AI models are free. The software is free.
                  You just need a computer that can run it.
                </p>
              </div>
            </div>

            <div className="text-center mt-6 pt-6 border-t border-border">
              <Link
                href="/learn"
                className="text-primary hover:underline text-sm font-medium"
              >
                Want to understand more about how this works? →
              </Link>
            </div>
          </motion.div>
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
              Ready to keep your AI conversations private?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Let's check if your computer can run AI privately.
              We'll walk you through every step - no tech skills needed.
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
                Private<span className="text-primary font-semibold">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted">
              AI that stays on your computer. Your privacy matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
