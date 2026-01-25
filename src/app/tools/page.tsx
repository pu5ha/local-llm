"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowRight,
  Monitor,
  Terminal,
  Apple,
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { tools, Tool } from "@/data/tools";

const difficultyColors = {
  beginner: "success",
  intermediate: "warning",
  advanced: "default",
} as const;

const platformIcons = {
  windows: Monitor,
  mac: Apple,
  linux: Terminal,
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Choose Your <span className="gradient-text">Tool</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            These are the most popular applications for running LLMs locally.
            Each has different strengths—pick the one that matches your comfort
            level.
          </p>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                Not sure where to start?
              </h3>
              <p className="text-muted">
                We recommend <strong>Ollama</strong> for most users. It's the
                easiest to set up and works great with most applications.
              </p>
            </div>
            <Link href="/guides/ollama">
              <Button>
                Start with Ollama
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="space-y-8">
          {tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Quick Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium">Tool</th>
                  <th className="text-left py-4 px-4 font-medium">Difficulty</th>
                  <th className="text-left py-4 px-4 font-medium">Has GUI</th>
                  <th className="text-left py-4 px-4 font-medium">API Server</th>
                  <th className="text-left py-4 px-4 font-medium">Best For</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} className="border-b border-border">
                    <td className="py-4 px-4 font-medium">{tool.name}</td>
                    <td className="py-4 px-4">
                      <Badge variant={difficultyColors[tool.difficulty]}>
                        {tool.difficulty}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {tool.id === "lm-studio" || tool.id === "gpt4all" ? (
                        <CheckCircle className="w-5 h-5 text-accent" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted" />
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <CheckCircle className="w-5 h-5 text-accent" />
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">
                      {tool.id === "ollama" && "Developers, CLI users"}
                      {tool.id === "lm-studio" && "Visual users, beginners"}
                      {tool.id === "gpt4all" && "Document Q&A, simplicity"}
                      {tool.id === "llama-cpp" && "Power users, custom setups"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-0 overflow-hidden" hover={false}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Main Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-semibold">{tool.name}</h3>
                    <Badge variant={difficultyColors[tool.difficulty]}>
                      {tool.difficulty}
                    </Badge>
                  </div>
                  <p className="text-muted">{tool.tagline}</p>
                </div>
              </div>

              <p className="text-muted mb-6">{tool.description}</p>

              {/* Platforms */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-muted">Platforms:</span>
                <div className="flex gap-2">
                  {tool.platforms.map((platform) => {
                    const Icon = platformIcons[platform];
                    return (
                      <div
                        key={platform}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-card border border-border"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm capitalize">{platform}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-2 mb-6">
                {tool.features.slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pros/Cons */}
            <div className="lg:w-72 space-y-4">
              <div className="bg-accent/5 rounded-lg p-4">
                <h4 className="font-medium text-accent mb-2">Pros</h4>
                <ul className="space-y-1">
                  {tool.pros.map((pro) => (
                    <li key={pro} className="text-sm text-muted flex items-start gap-2">
                      <span className="text-accent mt-1">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-warning/5 rounded-lg p-4">
                <h4 className="font-medium text-warning mb-2">Cons</h4>
                <ul className="space-y-1">
                  {tool.cons.map((con) => (
                    <li key={con} className="text-sm text-muted flex items-start gap-2">
                      <span className="text-warning mt-1">-</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-border mt-6">
            <Link href={`/guides/${tool.id}`}>
              <Button>
                View Setup Guide
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={tool.website} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                Official Website
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
