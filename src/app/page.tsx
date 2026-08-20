"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { TELEGRAM_CHANNEL_URL } from "@/lib/telegram/channel";
import styles from "./page.module.css";

const STEPS = [
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
    desc: "We'll match you with the right AI for your computer—takes 10 seconds.",
  },
  {
    num: 4,
    title: "Start chatting",
    desc: "That's it! Your conversations now stay on your computer forever.",
  },
];

const FAQS = [
  {
    q: "Do I need to be tech-savvy?",
    a: "Nope! If you can download an app and follow instructions, you can do this. We explain everything like you've never done it before.",
  },
  {
    q: "Is this as good as ChatGPT?",
    a: "For most things people actually use ChatGPT for—writing, brainstorming, answering questions, even basic coding help—yes. The small models that run on a laptop today handle tasks that needed a data-center-scale AI just two years ago.",
  },
  {
    q: "Will it slow down my computer?",
    a: "Only when you're actively chatting. When you're not using it, it doesn't use any resources at all.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing! The AI models are free. The software is free. You just need a computer that can run it.",
  },
];

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center md:text-left"
          >
            <div
              className={`${styles.eyebrow} mb-6 flex items-center justify-center md:justify-start gap-2`}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--home-accent)" }}
              />
              Not a company · just a setup guide
            </div>
            <div
              className="border-t mb-8"
              style={{ borderColor: "var(--home-border)" }}
            />

            <h1 className={`${styles.h1} mb-6`}>
              Your AI conversations,
              <br />
              <span style={{ color: "var(--home-accent)" }}>
                seen by no one.
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-xl mx-auto md:mx-0"
              style={{ color: "var(--home-muted)" }}
            >
              Everything you type in ChatGPT gets stored on their servers.
              Keep the same experience—without anyone watching.
            </p>

            <div className="flex justify-center md:justify-start mb-10">
              <Link href="/setup" className={styles.ctaButton}>
                Show Me How
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div
              className={`${styles.eyebrow} flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2`}
            >
              <span>10-min setup</span>
              <span style={{ color: "var(--home-border)" }}>|</span>
              <span>Same experience</span>
              <span style={{ color: "var(--home-border)" }}>|</span>
              <span>Nothing to buy</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Before/after comparison */}
      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-[1fr_auto_1.3fr] gap-4 sm:gap-3 items-center">
            <div
              className="rounded-lg px-4 py-5 text-center"
              style={{ border: "1px solid var(--home-border)" }}
            >
              <div className={`${styles.eyebrow} mb-3`}>The ChatGPT way</div>
              <div
                className="flex items-center justify-center gap-1.5 text-sm flex-wrap"
                style={{ color: "var(--home-muted)" }}
              >
                <span>You</span>
                <ArrowRight className="w-3 h-3" />
                <span>Internet</span>
                <ArrowRight className="w-3 h-3" />
                <span
                  style={{ color: "var(--home-accent)", fontWeight: 600 }}
                >
                  Their servers
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center">
              <div className={styles.vsBadge}>VS</div>
            </div>

            <div className={styles.terminalCard}>
              <div className={styles.terminalCardHeader}>
                <span className={styles.terminalDot} data-color="red" />
                <span className={styles.terminalDot} data-color="yellow" />
                <span className={styles.terminalDot} data-color="green" />
              </div>
              <div className={styles.terminalCardBody}>
                <span style={{ color: "var(--home-accent)" }}>$</span>{" "}
                <span>whoami</span>
                <br />
                <span style={{ opacity: 0.6 }}>
                  → stays on your computer
                </span>{" "}
                <span style={{ color: "var(--home-accent)" }}>✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section
        className="py-10 md:py-14 px-6"
        style={{
          borderTop: "1px solid var(--home-border)",
          borderBottom: "1px solid var(--home-border)",
        }}
      >
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 sm:gap-4 text-center">
          {[
            { big: "Not a company", small: "just a setup guide" },
            { big: "100%", small: "open source tools" },
            { big: "Zero", small: "data leaves your computer" },
          ].map((item, i) => (
            <div
              key={item.big}
              className={i > 0 ? "sm:border-l" : ""}
              style={i > 0 ? { borderColor: "var(--home-border)" } : undefined}
            >
              <div className="font-semibold text-lg mb-1">{item.big}</div>
              <div className={styles.eyebrow}>{item.small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[280px_1fr] gap-10 md:gap-16">
          <div>
            <div className={`${styles.eyebrow} mb-4`}>Simple process</div>
            <h2 className={styles.h2} style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              Set up private AI in 4 steps
            </h2>
            <p className="mt-4" style={{ color: "var(--home-muted)" }}>
              Most people finish in under 10 minutes.
            </p>
          </div>

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="grid grid-cols-[auto_1fr] gap-6 items-baseline"
              >
                <span className={styles.stepNumeral}>
                  {String(step.num).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p style={{ color: "var(--home-muted)" }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className={`${styles.h2} mb-10 text-center md:text-left`}
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            You might be wondering...
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {FAQS.map((item) => (
              <div key={item.q} className={styles.faqCell}>
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center md:text-left mt-8">
            <Link href="/learn" className={styles.textLink}>
              Want to understand more about how this works? →
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee reinforcing the core claims */}
      <div className={styles.marqueeBanner}>
        <div className={styles.marqueeContent}>
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>NOT A COMPANY</span>
              <span>•</span>
              <span>NO DATA COLLECTION</span>
              <span>•</span>
              <span>RUNS OFFLINE</span>
              <span>•</span>
              <span>OPEN SOURCE</span>
              <span>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className="max-w-3xl mx-auto px-6 text-center md:text-left">
          <h2 className={styles.ctaHeadline}>
            Stop sending your thoughts to the cloud.
          </h2>
          <p
            className="text-lg mb-10 max-w-xl mx-auto md:mx-0"
            style={{ opacity: 0.7 }}
          >
            Most computers made after 2018 work perfectly. We&apos;ll guide
            you through setup.
          </p>
          <div className="flex justify-center md:justify-start">
            <Link href="/setup" className={styles.ctaButtonInverse}>
              Show Me How
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className={`${styles.eyebrow} mt-8`} style={{ opacity: 0.6 }}>
            No account needed
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 px-6"
        style={{ borderTop: "1px solid var(--home-border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={styles.eyebrow}>
            Private
            <span style={{ color: "var(--home-accent)", fontWeight: 700 }}>
              AI
            </span>
          </div>
          <p className={styles.eyebrow}>
            AI that stays on your computer. Your privacy matters.
          </p>
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.eyebrow} flex items-center gap-1.5 hover:opacity-70 transition-opacity`}
          >
            <Send className="w-3.5 h-3.5" />
            Get news on Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}
