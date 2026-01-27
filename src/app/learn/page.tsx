"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Lock,
  Code,
  Server,
  Laptop,
  Cloud,
  CloudOff,
  Shield,
  DollarSign,
  Check,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-alt transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-muted">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stamp mx-auto mb-6">
              <Brain className="w-4 h-4" />
              For the Curious
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
              How Private AI Works
            </h1>

            <p className="text-lg text-muted max-w-2xl mx-auto">
              Want to understand what's happening behind the scenes? Here's
              everything explained in plain English.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is AI? */}
      <section className="py-12 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-6 text-center">
              What is AI, really?
            </h2>

            <div className="paper-card p-6 md:p-8">
              <p className="text-lg mb-6">
                When people talk about AI like ChatGPT, they're usually talking
                about something called a{" "}
                <strong>Large Language Model (LLM)</strong>. Don't let the fancy
                name intimidate you - here's what it actually means:
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      It's a very sophisticated autocomplete
                    </h3>
                    <p className="text-muted">
                      At its core, an AI model predicts what words should come
                      next based on what you've typed. It's learned patterns
                      from billions of examples of human writing, so it can
                      generate text that sounds natural and helpful.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center flex-shrink-0">
                    <Server className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      The model is just a file
                    </h3>
                    <p className="text-muted">
                      An AI model is essentially a large file (usually between
                      2GB and 50GB) that contains all the "knowledge" the AI has
                      learned. When you download a model, you're downloading
                      this file to your computer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Your computer runs the AI
                    </h3>
                    <p className="text-muted">
                      When you run AI locally, your computer does all the
                      thinking. It loads the model file into memory (RAM) and
                      uses your processor (CPU) to generate responses. No
                      internet needed after the initial download.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cloud vs Local */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-6 text-center">
              Cloud AI vs Private AI
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cloud AI */}
              <div className="paper-card p-6 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold">Cloud AI (ChatGPT, etc.)</h3>
                </div>

                <p className="text-muted mb-4">
                  When you use ChatGPT, Claude, or Gemini online, here's what
                  happens:
                </p>

                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>You type your message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Your message travels over the internet to their servers
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Their computers process your request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <span>The response travels back to you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      5
                    </span>
                    <span>
                      <strong>Your data may be stored and used for training</strong>
                    </span>
                  </li>
                </ol>

                <div className="mt-4 pt-4 border-t border-border text-sm text-muted">
                  <strong>Concerns:</strong> Someone else sees your data,
                  requires subscription, needs internet, data might be used to
                  train future models
                </div>
              </div>

              {/* Local AI */}
              <div className="paper-card p-6 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
                    <CloudOff className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Private AI (on your computer)</h3>
                </div>

                <p className="text-muted mb-4">
                  When you run AI on your own computer:
                </p>

                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-pale text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>You type your message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-pale text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Your computer processes it locally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-pale text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>You see the response</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-pale text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      <strong>That's it. Nothing leaves your computer.</strong>
                    </span>
                  </li>
                </ol>

                <div className="mt-4 pt-4 border-t border-border text-sm">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Shield className="w-4 h-4" />
                    100% Private
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is Open Source AI? */}
      <section className="py-12 bg-background-alt">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-6 text-center">
              What is "Open Source" AI?
            </h2>

            <div className="paper-card p-6 md:p-8">
              <p className="text-lg mb-6">
                "Open source" means the creators have made their AI models
                freely available for anyone to download and use. This is a big
                deal because:
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-background-alt rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Free to Use</h3>
                  </div>
                  <p className="text-sm text-muted">
                    Unlike ChatGPT which costs $20/month, open source models are
                    completely free. You download them once and use them
                    forever.
                  </p>
                </div>

                <div className="bg-background-alt rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">No Data Collection</h3>
                  </div>
                  <p className="text-sm text-muted">
                    Since you run it yourself, there's no company collecting
                    your conversations or training on your data.
                  </p>
                </div>

                <div className="bg-background-alt rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Constantly Improving</h3>
                  </div>
                  <p className="text-sm text-muted">
                    Researchers and companies around the world keep releasing
                    better models. New options appear every few months.
                  </p>
                </div>

                <div className="bg-background-alt rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">No Subscriptions</h3>
                  </div>
                  <p className="text-sm text-muted">
                    Run AI as much as you want without worrying about monthly
                    fees or usage limits.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-pale rounded-lg">
                <h4 className="font-semibold mb-2">Popular Open Source Models</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <strong>Llama 3</strong> - Made by Meta (Facebook), very
                    capable
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <strong>Mistral</strong> - Made in France, great for
                    reasoning
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <strong>DeepSeek</strong> - Excellent for coding tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <strong>Gemma</strong> - Made by Google, lightweight and fast
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why RAM Matters */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-6 text-center">
              Why Does RAM Matter?
            </h2>

            <div className="paper-card p-6 md:p-8">
              <p className="text-lg mb-6">
                You might have noticed we ask about your computer's RAM (memory).
                Here's why it matters:
              </p>

              <div className="space-y-4">
                <div className="bg-background-alt rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    AI models need to fit in memory
                  </h3>
                  <p className="text-sm text-muted">
                    When you run an AI model, it gets loaded into your
                    computer's RAM. A more capable model is typically larger,
                    requiring more RAM. If you don't have enough RAM, the model
                    either won't run or will be extremely slow.
                  </p>
                </div>

                <div className="bg-background-alt rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    More RAM = more capable AI
                  </h3>
                  <p className="text-sm text-muted">
                    With 8GB of RAM, you can run smaller, faster models that are
                    great for basic questions. With 16GB or more, you can run
                    larger models that are smarter and can handle complex tasks
                    like coding or long documents.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      8GB
                    </div>
                    <div className="text-sm text-muted">
                      Basic chat, quick answers
                    </div>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      16GB
                    </div>
                    <div className="text-sm text-muted">
                      Coding help, writing, analysis
                    </div>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      32GB+
                    </div>
                    <div className="text-sm text-muted">
                      Most powerful models
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-background-alt">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl mb-8 text-center">
              Common Questions
            </h2>

            <div className="space-y-3">
              <FAQItem
                question="Is it really as good as ChatGPT?"
                answer="It depends on what you need. For everyday questions, writing help, and basic coding, local models work great. For the most complex tasks, cloud AI like ChatGPT-4 is still more capable. But local AI is improving rapidly - and it's completely private."
              />
              <FAQItem
                question="Will it slow down my computer?"
                answer="While generating a response, your computer will be working hard. But it only uses resources when you're actively chatting. When you're not using it, it doesn't affect your computer at all."
              />
              <FAQItem
                question="Do I need an expensive gaming computer?"
                answer="No! Any modern computer with 8GB of RAM can run basic AI models. You don't need a fancy graphics card or gaming setup. If your computer was made in the last 5-6 years, it probably works."
              />
              <FAQItem
                question="Is it legal?"
                answer="Yes! Open source AI models are released under licenses that allow personal use. You can use them for almost anything, though some commercial uses may have restrictions depending on the model."
              />
              <FAQItem
                question="What's the catch?"
                answer="There isn't one, really. The main tradeoff is that local AI is slightly less capable than the best cloud AI, and you need a reasonably modern computer. But you get complete privacy and no subscription fees in return."
              />
              <FAQItem
                question="Can it access my files?"
                answer="Only if you explicitly tell it to. The AI models we help you set up are just chat bots by default - they can only see what you type to them. Some advanced setups allow file access, but that's optional and you control it."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl md:text-3xl mb-4">
              Ready to try it yourself?
            </h2>
            <p className="text-gray-400 mb-8">
              Now that you understand how it works, let's get you set up.
              We'll guide you through every step.
            </p>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded-lg hover:bg-primary-pale transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              Check My Computer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
