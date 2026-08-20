"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Terminal,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Zap,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Monitor,
  Apple,
  ArrowRight,
} from "lucide-react";
import { Card, CodeBlock } from "@/components/ui";

type Tab = "start" | "tips" | "troubleshooting";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "start", label: "Start Your AI", icon: RefreshCw },
  { id: "tips", label: "Tips & Tricks", icon: Lightbulb },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertCircle },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<Tab>("start");

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Help Center</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            Everything you need to get the most out of your private AI.
            New to this? Start with our{" "}
            <Link href="/setup" className="text-primary hover:underline">
              setup guide
            </Link>
            .
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 p-1 bg-background-alt rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white shadow-sm text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "start" && <StartTab />}
          {activeTab === "tips" && <TipsTab />}
          {activeTab === "troubleshooting" && <TroubleshootingTab />}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <h3 className="font-semibold mb-4 text-center">Need More Help?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/setup"
              className="flex items-center gap-2 px-4 py-2 bg-background-alt rounded-lg text-sm hover:bg-primary-pale transition-colors"
            >
              <Terminal className="w-4 h-4" />
              Setup Guide
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/learn"
              className="flex items-center gap-2 px-4 py-2 bg-background-alt rounded-lg text-sm hover:bg-primary-pale transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Learn More
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StartTab() {
  return (
    <div className="space-y-6">
      {/* Ollama Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Starting Ollama</h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="font-medium text-green-900 mb-2">
            Good news: Ollama runs automatically!
          </p>
          <p className="text-sm text-green-800">
            Ollama starts in the background whenever you turn on your computer.
            Look for the llama icon in your menu bar (Mac) or system tray
            (Windows) - if it's there, Ollama is ready to go.
          </p>
        </div>

        <h3 className="font-medium mb-4">To start a new chat:</h3>
        <ol className="space-y-4">
          <li className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Open Terminal (Mac) or PowerShell (Windows)</p>
              <div className="mt-2 text-sm text-muted space-y-2">
                <p className="flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  <strong>Mac:</strong> Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-background-alt rounded border text-xs">
                    Cmd
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-1.5 py-0.5 bg-background-alt rounded border text-xs">
                    Space
                  </kbd>
                  , type "Terminal", press Enter
                </p>
                <p className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <strong>Windows:</strong> Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-background-alt rounded border text-xs">
                    Windows
                  </kbd>
                  , type "PowerShell", click it
                </p>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">
              2
            </span>
            <div className="flex-1">
              <p className="font-medium mb-2">Type this command and press Enter:</p>
              <CodeBlock code="ollama run qwen3:8b" />
              <p className="text-sm text-muted mt-2">
                Replace <code className="bg-background-alt px-1 rounded">qwen3:8b</code> with
                whatever model you downloaded during setup.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Start chatting!</p>
              <p className="text-sm text-muted">
                The AI is already downloaded, so it will start instantly. Just
                type your question and press Enter.
              </p>
            </div>
          </li>
        </ol>
      </Card>

      {/* GUI Tools Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-semibold">Starting LM Studio or GPT4All</h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-medium text-green-900 mb-2">
            Just open the app like any other program!
          </p>
          <p className="text-sm text-green-800">
            Find your app in your <strong>Applications folder</strong> (Mac) or{" "}
            <strong>Start menu</strong> (Windows) and open it. Your AI model is
            already downloaded, so you can start chatting right away.
          </p>
        </div>
      </Card>
    </div>
  );
}

function TipsTab() {
  const tips = [
    {
      title: "Be specific with your questions",
      description:
        "Instead of asking 'Help me write', try 'Help me write a professional email to decline a meeting invitation politely'. The more context you give, the better the response.",
      icon: MessageSquare,
    },
    {
      title: "Use follow-up questions",
      description:
        "The AI remembers your conversation. You can say 'Make it shorter' or 'Explain that differently' without repeating your original question.",
      icon: RefreshCw,
    },
    {
      title: "Ask it to explain things",
      description:
        "The AI is great at breaking down complex topics. Try 'Explain [topic] like I'm 10 years old' for simple explanations.",
      icon: Lightbulb,
    },
    {
      title: "Try different models for different tasks",
      description:
        "Smaller models (like Qwen3 4B) are fast for simple questions. Larger models (like Qwen3 8B) are better for complex reasoning.",
      icon: Zap,
    },
    {
      title: "Exit and restart for a fresh conversation",
      description:
        "Type /bye to exit, then run the command again to start fresh. This is useful when the AI gets confused or you want to change topics.",
      icon: Terminal,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-6">Tips for Better Results</h2>
        <div className="space-y-6">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Example Prompts to Try</h2>
        <div className="grid gap-3">
          {[
            "Explain quantum computing in simple terms",
            "Help me write a thank you note for a gift",
            "Give me 5 dinner ideas using chicken and vegetables",
            "Summarize the pros and cons of working from home",
            "Debug this code: [paste your code]",
            "Create a workout plan for beginners",
          ].map((prompt, i) => (
            <div
              key={i}
              className="p-3 bg-background-alt rounded-lg text-sm text-muted hover:bg-primary-pale hover:text-primary transition-colors cursor-pointer"
            >
              "{prompt}"
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Useful Commands</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-background-alt rounded-lg">
            <code className="font-mono text-sm bg-foreground/10 px-2 py-1 rounded">
              /bye
            </code>
            <span className="text-sm text-muted">Exit the chat</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-background-alt rounded-lg">
            <code className="font-mono text-sm bg-foreground/10 px-2 py-1 rounded">
              ollama list
            </code>
            <span className="text-sm text-muted">See all downloaded models</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-background-alt rounded-lg">
            <code className="font-mono text-sm bg-foreground/10 px-2 py-1 rounded">
              ollama run [model]
            </code>
            <span className="text-sm text-muted">Start chatting with a model</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-background-alt rounded-lg">
            <code className="font-mono text-sm bg-foreground/10 px-2 py-1 rounded">
              ollama pull [model]
            </code>
            <span className="text-sm text-muted">Download a new model</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TroubleshootingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold">Common Issues</h2>
        </div>

        <div className="space-y-6">
          {/* Issue 1 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              "Ollama won't start" or "Command not found"
            </h3>
            <div className="text-sm text-muted space-y-2">
              <p>First, check if Ollama is running:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Look for the llama icon in your menu bar (Mac) or system tray
                  (Windows)
                </li>
                <li>If you don't see it, try restarting your computer</li>
              </ul>
              <p className="mt-3">
                If it still doesn't work, Ollama may need to be reinstalled:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://ollama.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ollama.ai
                  </a>{" "}
                  and download it again
                </li>
                <li>Follow the installation steps from the beginning</li>
              </ul>
            </div>
          </div>

          {/* Issue 2 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              "Download stuck" or "Connection error"
            </h3>
            <div className="text-sm text-muted space-y-2">
              <p>If the AI model download gets stuck:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check your internet connection</li>
                <li>
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-background-alt rounded border text-xs">
                    Ctrl+C
                  </kbd>{" "}
                  to cancel the download
                </li>
                <li>Try again with the pull command:</li>
              </ul>
              <div className="mt-2">
                <CodeBlock code="ollama pull qwen3:8b" />
              </div>
            </div>
          </div>

          {/* Issue 3 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              "Responses are very slow"
            </h3>
            <div className="text-sm text-muted space-y-2">
              <p>This is normal behavior in some cases:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  The first response is always slower while the AI "warms up"
                </li>
                <li>Longer questions take more time to process</li>
                <li>
                  If it's consistently slow, your computer may need more RAM
                </li>
              </ul>
              <p className="mt-3">
                Try a smaller model like{" "}
                <strong>Qwen3 4B</strong> - it's faster and uses less
                memory:
              </p>
              <div className="mt-2">
                <CodeBlock code="ollama run qwen3:4b" />
              </div>
            </div>
          </div>

          {/* Issue 4 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              "I want to try a different AI model"
            </h3>
            <div className="text-sm text-muted space-y-2">
              <p>You can download and try any model! Here are some popular ones:</p>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <code className="bg-background-alt px-2 py-1 rounded text-xs">
                    ollama run qwen3:4b
                  </code>
                  <span>- Fast, lightweight</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-background-alt px-2 py-1 rounded text-xs">
                    ollama run qwen3:8b
                  </code>
                  <span>- Smarter, best balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-background-alt px-2 py-1 rounded text-xs">
                    ollama run deepseek-r1:7b
                  </code>
                  <span>- Great for step-by-step reasoning</span>
                </div>
              </div>
              <p className="mt-3">
                Each new model needs to download once, then it's saved on your
                computer.
              </p>
            </div>
          </div>

          {/* Issue 5 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              "The AI gives wrong or weird answers"
            </h3>
            <div className="text-sm text-muted space-y-2">
              <p>Try these fixes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Start fresh:</strong> Type{" "}
                  <code className="bg-background-alt px-1 rounded">/bye</code>{" "}
                  and run the command again
                </li>
                <li>
                  <strong>Be more specific:</strong> Give more context in your
                  question
                </li>
                <li>
                  <strong>Try a different model:</strong> Some models are better
                  at certain tasks
                </li>
              </ul>
              <p className="mt-3">
                Remember: Local AI models are smaller than cloud ones like
                ChatGPT. They're great for most tasks but may struggle with very
                complex questions.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Still Having Trouble?</h2>
        <p className="text-muted mb-4">
          If you're still stuck, try going through the setup process again. Our
          step-by-step guide covers everything from installation to your first
          chat.
        </p>
        <Link
          href="/setup"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Go to Setup Guide
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Card>
    </div>
  );
}
