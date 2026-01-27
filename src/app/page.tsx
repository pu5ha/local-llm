"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Check, Users } from "lucide-react";

export default function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero Section - Lead with the benefit */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Brand name prominent */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="6" fill="#1a5f4a" />
                <path d="M10 16h12M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="10" cy="10" r="2" fill="#c9a227" />
                <circle cx="22" cy="22" r="2" fill="#c9a227" />
              </svg>
              <span className="font-serif text-lg">
                Private<span className="text-primary font-semibold">AI</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-4">
              Run AI on your computer.
              <br />
              <span className="text-primary">Private. Free. Forever.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              ChatGPT works, but everything you type gets sent to OpenAI's servers.
              Run AI locally instead - same experience, total privacy.
            </p>

            {/* Primary CTA - above the fold */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/setup" className="btn-primary">
                Start Your Private AI
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                No tech skills needed
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Works just like ChatGPT
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                No subscriptions
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compact visual comparison */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* ChatGPT way */}
            <div className="paper-card p-5 border-red-200">
              <div className="flex items-center gap-2 mb-3 text-red-600">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-medium text-sm">ChatGPT</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>You</span>
                <ArrowRight className="w-3 h-3" />
                <span>Internet</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-red-600">OpenAI servers</span>
              </div>
            </div>

            {/* PrivateAI way */}
            <div className="paper-card p-5 border-primary/30 bg-primary-pale/30">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium text-sm">PrivateAI</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>You</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-primary font-medium">Your computer</span>
                <Check className="w-4 h-4 text-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 md:py-12 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm">
                <strong className="text-foreground">2,500+</strong>
                <span className="text-muted"> people have made the switch</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">
                <strong className="text-foreground">100%</strong>
                <span className="text-muted"> open source tools</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm">
                <strong className="text-foreground">Zero</strong>
                <span className="text-muted"> data leaves your computer</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-background-alt">
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
              We'll walk you through every step
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Choose your app",
                desc: "We recommend Ollama - it's free, easy, and works just like ChatGPT.",
              },
              {
                num: 2,
                title: "Install it",
                desc: "Just download and install like any other app. We'll show you exactly how.",
              },
              {
                num: 3,
                title: "Download an AI model",
                desc: "Tell us how much memory your computer has, and we'll recommend the best AI for you.",
              },
              {
                num: 4,
                title: "Start chatting",
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
        </div>
      </section>

      {/* Reassurance Section */}
      <section className="py-16 md:py-20">
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
              href="/setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded-lg hover:bg-primary-pale transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              Start Your Private AI
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
