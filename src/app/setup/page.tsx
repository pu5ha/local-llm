"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Circle,
  Monitor,
  Download,
  Terminal,
  MessageSquare,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { Button, Card, Badge, CodeBlock } from "@/components/ui";
import HardwareDetector from "@/components/HardwareDetector";
import useHardwareDetection from "@/hooks/useHardwareDetection";
import { tools } from "@/data/tools";
import { getFeaturedModels } from "@/data/models";

type Step = "hardware" | "tool" | "install" | "model" | "complete";

const stepOrder: Step[] = ["hardware", "tool", "install", "model", "complete"];

const stepInfo = {
  hardware: { title: "Check Hardware", icon: Monitor },
  tool: { title: "Choose Tool", icon: Download },
  install: { title: "Install", icon: Terminal },
  model: { title: "Download Model", icon: Cpu },
  complete: { title: "Complete", icon: MessageSquare },
};

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState<Step>("hardware");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const { hardware } = useHardwareDetection();

  const currentIndex = stepOrder.indexOf(currentStep);

  const goNext = () => {
    if (currentIndex < stepOrder.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const goToStep = (step: Step) => {
    const stepIndex = stepOrder.indexOf(step);
    if (stepIndex <= currentIndex || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Setup <span className="gradient-text">Wizard</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            We'll walk you through setting up a local LLM step by step. No
            technical experience required.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            {stepOrder.map((step, index) => {
              const StepIcon = stepInfo[step].icon;
              const isActive = step === currentStep;
              const isCompleted = completedSteps.includes(step);
              const isClickable =
                index <= currentIndex || completedSteps.includes(step);

              return (
                <div key={step} className="flex items-center">
                  <button
                    onClick={() => isClickable && goToStep(step)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-2 ${
                      isClickable ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-primary text-white"
                          : isCompleted
                          ? "bg-accent text-white"
                          : "bg-card border border-border text-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs hidden sm:block ${
                        isActive
                          ? "text-primary font-medium"
                          : isCompleted
                          ? "text-accent"
                          : "text-muted"
                      }`}
                    >
                      {stepInfo[step].title}
                    </span>
                  </button>
                  {index < stepOrder.length - 1 && (
                    <div
                      className={`w-12 sm:w-24 h-0.5 mx-2 ${
                        completedSteps.includes(step)
                          ? "bg-accent"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === "hardware" && (
              <StepHardware onNext={goNext} />
            )}
            {currentStep === "tool" && (
              <StepTool
                selectedTool={selectedTool}
                onSelect={setSelectedTool}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {currentStep === "install" && (
              <StepInstall
                selectedTool={selectedTool}
                os={hardware.os}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {currentStep === "model" && (
              <StepModel
                selectedTool={selectedTool}
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {currentStep === "complete" && (
              <StepComplete
                selectedTool={selectedTool}
                selectedModel={selectedModel}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepHardware({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <HardwareDetector />
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StepTool({
  selectedTool,
  onSelect,
  onNext,
  onPrev,
}: {
  selectedTool: string | null;
  onSelect: (tool: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const beginnerTools = tools.filter((t) => t.difficulty === "beginner");

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Choose Your Tool</h3>
        <p className="text-muted mb-6">
          We recommend starting with one of these beginner-friendly options.
        </p>

        <div className="space-y-4">
          {beginnerTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedTool === tool.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedTool === tool.id
                      ? "bg-primary text-white"
                      : "bg-card-hover"
                  }`}
                >
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{tool.name}</span>
                    {tool.id === "ollama" && (
                      <Badge variant="primary">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted">{tool.tagline}</p>
                </div>
                {selectedTool === tool.id && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Link href="/tools" className="text-sm text-primary hover:underline">
            View all tools including advanced options →
          </Link>
        </div>
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedTool}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StepInstall({
  selectedTool,
  os,
  onNext,
  onPrev,
}: {
  selectedTool: string | null;
  os: string;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [installed, setInstalled] = useState(false);
  const tool = tools.find((t) => t.id === selectedTool);

  const getInstallInstructions = () => {
    if (selectedTool === "ollama") {
      if (os === "mac") {
        return {
          title: "Install Ollama on macOS",
          steps: [
            { text: "Download Ollama from the official website", command: null },
            { text: "Open the downloaded .dmg file", command: null },
            { text: "Drag Ollama to your Applications folder", command: null },
            { text: "Open Ollama from Applications", command: null },
            {
              text: "Verify installation by running:",
              command: "ollama --version",
            },
          ],
          downloadUrl: "https://ollama.ai/download/mac",
        };
      } else if (os === "linux") {
        return {
          title: "Install Ollama on Linux",
          steps: [
            {
              text: "Run this command in your terminal:",
              command: "curl -fsSL https://ollama.ai/install.sh | sh",
            },
            { text: "Wait for the installation to complete", command: null },
            {
              text: "Verify installation:",
              command: "ollama --version",
            },
          ],
          downloadUrl: null,
        };
      } else {
        return {
          title: "Install Ollama on Windows",
          steps: [
            { text: "Download Ollama from the official website", command: null },
            { text: "Run the installer (.exe file)", command: null },
            { text: "Follow the installation prompts", command: null },
            {
              text: "Open PowerShell and verify:",
              command: "ollama --version",
            },
          ],
          downloadUrl: "https://ollama.ai/download/windows",
        };
      }
    }

    if (selectedTool === "lm-studio") {
      return {
        title: `Install LM Studio on ${os === "mac" ? "macOS" : os === "linux" ? "Linux" : "Windows"}`,
        steps: [
          { text: "Download LM Studio from the official website", command: null },
          { text: "Run the installer", command: null },
          { text: "Open LM Studio when installation completes", command: null },
        ],
        downloadUrl: "https://lmstudio.ai",
      };
    }

    if (selectedTool === "gpt4all") {
      return {
        title: `Install GPT4All on ${os === "mac" ? "macOS" : os === "linux" ? "Linux" : "Windows"}`,
        steps: [
          { text: "Download GPT4All from the official website", command: null },
          { text: "Run the installer", command: null },
          { text: "Open GPT4All when installation completes", command: null },
        ],
        downloadUrl: "https://gpt4all.io",
      };
    }

    return {
      title: "Install Tool",
      steps: [{ text: "Download from the official website", command: null }],
      downloadUrl: tool?.downloadUrl || null,
    };
  };

  const instructions = getInstallInstructions();

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">{instructions.title}</h3>
        <p className="text-muted mb-6">
          Follow these steps to install {tool?.name} on your computer.
        </p>

        {instructions.downloadUrl && (
          <a
            href={instructions.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-6"
          >
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Download {tool?.name}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        )}

        <ol className="space-y-4">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="mb-2">{step.text}</p>
                {step.command && <CodeBlock code={step.command} />}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 pt-6 border-t border-border">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => setInstalled(!installed)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                installed
                  ? "bg-accent border-accent"
                  : "border-border hover:border-primary"
              }`}
            >
              {installed && <CheckCircle className="w-4 h-4 text-white" />}
            </button>
            <span>I have installed {tool?.name}</span>
          </label>
        </div>
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!installed}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StepModel({
  selectedTool,
  selectedModel,
  onSelect,
  onNext,
  onPrev,
}: {
  selectedTool: string | null;
  selectedModel: string | null;
  onSelect: (model: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const models = getFeaturedModels();

  const getDownloadCommand = (ollamaName: string | undefined) => {
    if (selectedTool === "ollama" && ollamaName) {
      return `ollama run ${ollamaName}`;
    }
    return null;
  };

  const selectedModelData = models.find((m) => m.id === selectedModel);

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Download a Model</h3>
        <p className="text-muted mb-6">
          Choose a model to download. We recommend starting with a smaller model
          to test your setup.
        </p>

        <div className="grid gap-3">
          {models.slice(0, 4).map((model) => (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedModel === model.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {model.name} {model.parameters}
                    </span>
                    <Badge variant="default">{model.ramRequired}</Badge>
                    {model.id === "llama-3.2-3b" && (
                      <Badge variant="primary">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted line-clamp-1">
                    {model.description}
                  </p>
                </div>
                {selectedModel === model.id ? (
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-border flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedModel && selectedModelData && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium mb-3">Download Command</h4>
            {selectedTool === "ollama" && selectedModelData.ollamaName ? (
              <>
                <CodeBlock
                  code={getDownloadCommand(selectedModelData.ollamaName)!}
                />
                <p className="text-sm text-muted mt-3">
                  This command will download the model and start a chat. The first
                  download may take a few minutes depending on your internet
                  speed.
                </p>
              </>
            ) : (
              <p className="text-muted">
                Open {tools.find((t) => t.id === selectedTool)?.name} and search
                for "{selectedModelData.name}" to download it.
              </p>
            )}

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setDownloaded(!downloaded)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    downloaded
                      ? "bg-accent border-accent"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {downloaded && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                <span>I have downloaded the model</span>
              </label>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedModel || !downloaded}>
          Complete Setup
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StepComplete({
  selectedTool,
  selectedModel,
}: {
  selectedTool: string | null;
  selectedModel: string | null;
}) {
  const tool = tools.find((t) => t.id === selectedTool);
  const model = getFeaturedModels().find((m) => m.id === selectedModel);

  return (
    <div className="space-y-6">
      <Card className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
        <p className="text-muted max-w-md mx-auto">
          Your private AI is ready. Your conversations never leave your computer.
        </p>
      </Card>

      {/* How to Use - THE IMPORTANT PART */}
      <Card className="border-2 border-primary">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">How to Use Your AI</h3>
        </div>

        {selectedTool === "ollama" ? (
          <div className="space-y-4">
            <div className="bg-background-alt rounded-lg p-4">
              <p className="font-medium mb-2">You're already in a chat!</p>
              <p className="text-sm text-muted mb-3">
                After running <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-xs">ollama run {model?.ollamaName || "llama3.2"}</code>,
                you're in an interactive chat. Just type your question and press <strong>Enter</strong>.
              </p>
              <div className="font-mono text-sm bg-foreground text-background rounded-lg p-4">
                <div className="text-gray-400 mb-2">{">>>"} <span className="text-white">What's the capital of France?</span></div>
                <div className="text-gray-300">The capital of France is Paris...</div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Try these prompts:</h4>
              <div className="grid gap-2">
                {[
                  "Explain quantum computing in simple terms",
                  "Write a haiku about coding",
                  "What are some healthy breakfast ideas?",
                  "Help me write a professional email",
                ].map((prompt) => (
                  <div
                    key={prompt}
                    className="text-sm bg-background-alt rounded-lg px-3 py-2 text-muted"
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-2">Useful commands:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <code className="bg-foreground/10 px-2 py-1 rounded text-xs flex-shrink-0">/bye</code>
                  <span className="text-muted">Exit the chat</span>
                </div>
                <div className="flex items-start gap-3">
                  <code className="bg-foreground/10 px-2 py-1 rounded text-xs flex-shrink-0">ollama run {model?.ollamaName || "llama3.2"}</code>
                  <span className="text-muted">Start a new chat anytime</span>
                </div>
                <div className="flex items-start gap-3">
                  <code className="bg-foreground/10 px-2 py-1 rounded text-xs flex-shrink-0">ollama list</code>
                  <span className="text-muted">See your downloaded models</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted">
              Open {tool?.name} and start chatting! Your conversations are processed
              entirely on your computer.
            </p>
          </div>
        )}
      </Card>

      {/* Want a nicer interface? */}
      <Card>
        <h3 className="font-semibold mb-3">Want a ChatGPT-like interface?</h3>
        <p className="text-sm text-muted mb-4">
          The terminal works great, but if you prefer a graphical chat interface,
          you can use Open WebUI - a beautiful web interface that connects to Ollama.
        </p>
        <div className="bg-background-alt rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Quick setup with Docker:</p>
          <CodeBlock code="docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main" />
          <p className="text-xs text-muted mt-2">
            Then visit <a href="http://localhost:3000" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">localhost:3000</a> in your browser.
          </p>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/models">
          <Button variant="secondary">Browse More Models</Button>
        </Link>
        {tool && (
          <Link href={`/guides/${tool.id}`}>
            <Button>
              Full {tool.name} Guide
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
