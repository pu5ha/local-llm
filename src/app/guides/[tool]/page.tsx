"use client";

import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Terminal,
  Download,
  MessageSquare,
  Settings,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button, Card, Badge, CodeBlock } from "@/components/ui";
import { tools } from "@/data/tools";

interface GuideSection {
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const ollamaGuide: GuideSection[] = [
  {
    title: "Installation",
    icon: Download,
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">macOS</h4>
          <p className="text-muted mb-3">
            Download Ollama from the official website and drag it to your
            Applications folder.
          </p>
          <a
            href="https://ollama.ai/download/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="mb-4">
              <Download className="w-4 h-4" />
              Download for macOS
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>

        <div>
          <h4 className="font-medium mb-3">Linux</h4>
          <p className="text-muted mb-3">
            Run this single command to install Ollama:
          </p>
          <CodeBlock code="curl -fsSL https://ollama.ai/install.sh | sh" />
        </div>

        <div>
          <h4 className="font-medium mb-3">Windows</h4>
          <p className="text-muted mb-3">
            Download and run the Windows installer:
          </p>
          <a
            href="https://ollama.ai/download/windows"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Download for Windows
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>

        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
          <h4 className="font-medium text-accent mb-2">Verify Installation</h4>
          <p className="text-sm text-muted mb-3">
            After installation, open your terminal and run:
          </p>
          <CodeBlock code="ollama --version" />
          <p className="text-sm text-muted mt-3">
            You should see the Ollama version number if installed correctly.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Running Your First Model",
    icon: Terminal,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          Ollama makes it incredibly easy to download and run models. Here are
          some popular options:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-card-hover rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Llama 3.2 (3B)</h4>
              <Badge variant="success">Recommended for beginners</Badge>
            </div>
            <p className="text-sm text-muted mb-3">
              Meta's latest compact model. Great balance of quality and speed.
            </p>
            <CodeBlock code="ollama run llama3.2" />
          </div>

          <div className="p-4 bg-card-hover rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Mistral 7B</h4>
              <Badge>Great for coding</Badge>
            </div>
            <p className="text-sm text-muted mb-3">
              Excellent reasoning and coding capabilities.
            </p>
            <CodeBlock code="ollama run mistral" />
          </div>

          <div className="p-4 bg-card-hover rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">DeepSeek Coder</h4>
              <Badge>Best for programming</Badge>
            </div>
            <p className="text-sm text-muted mb-3">
              Specialized coding model with excellent code generation.
            </p>
            <CodeBlock code="ollama run deepseek-coder" />
          </div>
        </div>

        <p className="text-sm text-muted">
          The first time you run a model, Ollama will download it automatically.
          This may take a few minutes depending on your internet speed.
        </p>
      </div>
    ),
  },
  {
    title: "Chatting with Models",
    icon: MessageSquare,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          Once a model is running, you can chat with it directly in your
          terminal. Here's how it works:
        </p>

        <div className="p-4 bg-[#0d0d12] rounded-lg font-mono text-sm">
          <div className="text-muted mb-2">$ ollama run llama3.2</div>
          <div className="text-muted mb-2">pulling manifest...</div>
          <div className="text-muted mb-2">pulling model...</div>
          <div className="text-accent mb-4">success</div>
          <div className="mb-2">
            <span className="text-primary">{">>> "}</span>
            <span>What is the capital of France?</span>
          </div>
          <div className="text-foreground">
            The capital of France is Paris. It's the largest city in France and
            serves as the country's political, economic, and cultural center...
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Useful Commands</h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-3 text-sm">
              <code className="bg-card-hover px-2 py-1 rounded">/bye</code>
              <span className="text-muted">Exit the chat</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <code className="bg-card-hover px-2 py-1 rounded">/clear</code>
              <span className="text-muted">Clear conversation history</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <code className="bg-card-hover px-2 py-1 rounded">/help</code>
              <span className="text-muted">Show all available commands</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Managing Models",
    icon: Settings,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          Ollama provides simple commands to manage your downloaded models:
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">List installed models</h4>
            <CodeBlock code="ollama list" />
          </div>

          <div>
            <h4 className="font-medium mb-2">Download a model without running</h4>
            <CodeBlock code="ollama pull llama3.2" />
          </div>

          <div>
            <h4 className="font-medium mb-2">Remove a model</h4>
            <CodeBlock code="ollama rm llama3.2" />
          </div>

          <div>
            <h4 className="font-medium mb-2">Show model information</h4>
            <CodeBlock code="ollama show llama3.2" />
          </div>
        </div>

        <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
          <h4 className="font-medium text-warning mb-2">Storage Note</h4>
          <p className="text-sm text-muted">
            Models can be quite large (2-10GB each). Make sure you have enough
            disk space. Use <code>ollama list</code> to see the size of each
            model.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Using the API",
    icon: Zap,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          Ollama runs a local API server that other applications can connect to.
          This lets you use local models with various AI tools.
        </p>

        <div>
          <h4 className="font-medium mb-3">API Endpoint</h4>
          <p className="text-sm text-muted mb-3">
            Ollama's API runs on port 11434 by default:
          </p>
          <CodeBlock code="http://localhost:11434" />
        </div>

        <div>
          <h4 className="font-medium mb-3">Example API Call</h4>
          <CodeBlock
            code={`curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is the sky blue?"
}'`}
          />
        </div>

        <div>
          <h4 className="font-medium mb-3">Compatible Applications</h4>
          <p className="text-sm text-muted mb-3">
            Many apps support Ollama's API out of the box:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Open WebUI (ChatGPT-like interface)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Continue (VS Code extension)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>AnythingLLM</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>LangChain</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
];

const lmStudioGuide: GuideSection[] = [
  {
    title: "Installation",
    icon: Download,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          LM Studio provides a graphical interface for running LLMs. Download it
          from the official website:
        </p>
        <a
          href="https://lmstudio.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Download LM Studio
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
        <p className="text-sm text-muted">
          Available for macOS, Windows, and Linux. The installer will guide you
          through the setup process.
        </p>
      </div>
    ),
  },
  {
    title: "Getting Started",
    icon: Terminal,
    content: (
      <div className="space-y-4">
        <p className="text-muted">
          LM Studio has a built-in model browser. Simply search for models and
          click to download them. Popular options include Llama 3.2, Mistral,
          and Phi-3.
        </p>
        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
          <p className="text-sm">
            Tip: Look for GGUF format models as they work best with LM Studio.
          </p>
        </div>
      </div>
    ),
  },
];

const gpt4allGuide: GuideSection[] = [
  {
    title: "Installation",
    icon: Download,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          GPT4All is a simple desktop application focused on privacy:
        </p>
        <a
          href="https://gpt4all.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Download GPT4All
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    ),
  },
  {
    title: "Features",
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-muted">GPT4All includes a unique LocalDocs feature that lets you chat with your documents privately.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>Chat with PDFs, Word docs, and text files</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>All processing happens locally</span>
          </li>
        </ul>
      </div>
    ),
  },
];

const llamaCppGuide: GuideSection[] = [
  {
    title: "Installation",
    icon: Download,
    content: (
      <div className="space-y-6">
        <p className="text-muted">
          llama.cpp requires building from source. This is recommended for
          advanced users who want maximum performance and control.
        </p>
        <CodeBlock
          code={`git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make`}
        />
        <a
          href="https://github.com/ggerganov/llama.cpp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary">
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    ),
  },
];

const guides: Record<string, GuideSection[]> = {
  ollama: ollamaGuide,
  "lm-studio": lmStudioGuide,
  gpt4all: gpt4allGuide,
  "llama-cpp": llamaCppGuide,
};

export default function GuidePage() {
  const params = useParams();
  const toolId = params.tool as string;
  const tool = tools.find((t) => t.id === toolId);
  const guide = guides[toolId];

  if (!tool || !guide) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Terminal className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{tool.name} Guide</h1>
              <p className="text-muted">{tool.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="success">{tool.difficulty}</Badge>
            {tool.platforms.map((p) => (
              <Badge key={p} variant="default">
                {p}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Guide Sections */}
        <div className="space-y-8">
          {guide.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                {section.content}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold mb-1">Need More Help?</h3>
              <p className="text-sm text-muted">
                Check out the official documentation for advanced features and
                troubleshooting.
              </p>
            </div>
            <a href={tool.website} target="_blank" rel="noopener noreferrer">
              <Button>
                Official Docs
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
