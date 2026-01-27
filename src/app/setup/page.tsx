"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button, Card, Badge, CodeBlock } from "@/components/ui";
import HardwareDetector from "@/components/HardwareDetector";
import useHardwareDetection from "@/hooks/useHardwareDetection";
import { tools } from "@/data/tools";
import { getFeaturedModels } from "@/data/models";

type Step = "hardware" | "tool" | "install" | "model" | "complete";

const stepOrder: Step[] = ["hardware", "tool", "install", "model", "complete"];

const stepInfo = {
  hardware: { title: "Your Computer", icon: Monitor },
  tool: { title: "Choose App", icon: Download },
  install: { title: "Install", icon: Terminal },
  model: { title: "Download AI", icon: Cpu },
  complete: { title: "Done!", icon: MessageSquare },
};

function SetupPageContent() {
  const searchParams = useSearchParams();
  const ramFromUrl = searchParams.get("ram");
  const confirmedRam = ramFromUrl ? parseInt(ramFromUrl, 10) : null;

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Set Up Your <span className="gradient-text">Private AI</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            We'll walk you through every step. Don't worry if you've never done
            anything like this before - we'll explain everything.
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
              <StepHardware onNext={goNext} confirmedRam={confirmedRam} />
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
                confirmedRam={confirmedRam}
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

function StepHardware({ onNext, confirmedRam }: { onNext: () => void; confirmedRam: number | null }) {
  return (
    <div>
      <HardwareDetector confirmedRam={confirmedRam} />
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

  const toolDetails: Record<string, { description: string; bestFor: string; interface: string; beginner: string }> = {
    ollama: {
      description: "The most popular way to run AI. You type in a text window and the AI responds.",
      bestFor: "Most people - it's reliable and works great",
      interface: "Text window (called Terminal or PowerShell)",
      beginner: "We'll show you exactly how to use it, step by step",
    },
    "lm-studio": {
      description: "A visual app that looks similar to ChatGPT. Point and click interface.",
      bestFor: "People who prefer clicking buttons over typing commands",
      interface: "Desktop app that looks like ChatGPT",
      beginner: "Very visual and easy to navigate",
    },
    "gpt4all": {
      description: "A simple app focused on privacy. Clean chat interface with basic features.",
      bestFor: "Simple needs and complete beginners",
      interface: "Desktop app with chat interface",
      beginner: "Designed to be as simple as possible",
    },
  };

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Which app would you like to use?</h3>
        <p className="text-muted mb-4">
          To run AI privately, you need an app on your computer. Think of it like
          how you need a web browser to visit websites - you need one of these
          apps to chat with AI.
        </p>

        {/* Recommendation */}
        <div className="bg-primary-pale rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Not sure which to pick?</p>
              <p className="text-muted">
                We recommend <strong className="text-primary">Ollama</strong> - it's
                the most popular and reliable option. Don't worry about the "Terminal"
                part - we'll show you exactly what to do!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {beginnerTools.map((tool) => {
            const details = toolDetails[tool.id];
            return (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className={`w-full text-left p-5 rounded-lg border-2 transition-colors ${
                  selectedTool === tool.id
                    ? "border-primary bg-primary/5"
                    : tool.id === "ollama"
                    ? "border-primary/30 bg-primary/5 hover:border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedTool === tool.id
                        ? "bg-primary text-white"
                        : "bg-background-alt"
                    }`}
                  >
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg">{tool.name}</span>
                      {tool.id === "ollama" && (
                        <Badge variant="primary">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-muted mb-3">{details?.description || tool.tagline}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted">
                        <span className="font-medium text-foreground">Best for:</span> {details?.bestFor}
                      </p>
                      <p className="text-primary text-xs">{details?.beginner}</p>
                    </div>
                  </div>
                  {selectedTool === tool.id && (
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
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
          title: "Installing Ollama on your Mac",
          intro: "This will only take a few minutes. We'll go through each step together.",
          steps: [
            {
              title: "Download Ollama",
              description: "Click the green button below to go to the Ollama website. On that page, click the big \"Download for macOS\" button.",
              action: "download",
              downloadUrl: "https://ollama.ai/download/mac",
            },
            {
              title: "Find the downloaded file",
              description: "Open Finder (the blue smiley face icon in your dock). Click \"Downloads\" on the left side. You should see a file called \"Ollama-darwin.zip\".",
            },
            {
              title: "Open the file",
              description: "Double-click on \"Ollama-darwin.zip\". This will unzip it and show you the Ollama app.",
            },
            {
              title: "Move Ollama to Applications",
              description: "Drag the Ollama app icon onto the \"Applications\" folder. If you see a window asking you to do this, just drag it there.",
            },
            {
              title: "Open Ollama",
              description: "Open Finder, click \"Applications\" on the left, and double-click \"Ollama\". If you see a warning about opening an app from the internet, click \"Open\" to continue.",
            },
            {
              title: "Look for the llama icon",
              description: "You'll see a small llama icon appear in your menu bar (the top-right area of your screen). This means Ollama is running!",
              success: true,
            },
          ],
        };
      } else if (os === "windows") {
        return {
          title: "Installing Ollama on Windows",
          intro: "This will only take a few minutes. We'll go through each step together.",
          steps: [
            {
              title: "Download Ollama",
              description: "Click the green button below to go to the Ollama website. On that page, click the big \"Download for Windows\" button.",
              action: "download",
              downloadUrl: "https://ollama.ai/download/windows",
            },
            {
              title: "Run the installer",
              description: "Find the downloaded file (usually in your Downloads folder) called \"OllamaSetup.exe\". Double-click it to start the installation.",
            },
            {
              title: "Follow the installer",
              description: "Click \"Next\" through the installer screens, then click \"Install\". Wait for it to finish, then click \"Finish\".",
            },
            {
              title: "Ollama is now running",
              description: "Ollama starts automatically after installation. You might see a llama icon in your system tray (bottom-right of your screen).",
              success: true,
            },
          ],
        };
      } else {
        return {
          title: "Installing Ollama on Linux",
          intro: "Run this command in your terminal to install Ollama:",
          steps: [
            {
              title: "Open Terminal",
              description: "Open your terminal application.",
            },
            {
              title: "Run the install command",
              description: "Copy and paste this command, then press Enter:",
              command: "curl -fsSL https://ollama.ai/install.sh | sh",
            },
            {
              title: "Wait for installation",
              description: "Wait for the installation to complete. You'll see a success message when it's done.",
              success: true,
            },
          ],
        };
      }
    }

    if (selectedTool === "lm-studio") {
      return {
        title: `Installing LM Studio`,
        intro: "LM Studio is a visual app - just download and install like any other program.",
        steps: [
          {
            title: "Download LM Studio",
            description: "Click the button below to go to their website, then click the download button for your system.",
            action: "download",
            downloadUrl: "https://lmstudio.ai",
          },
          {
            title: "Install the app",
            description: os === "mac"
              ? "Open the downloaded file and drag LM Studio to your Applications folder."
              : "Run the downloaded installer and follow the prompts.",
          },
          {
            title: "Open LM Studio",
            description: "Find LM Studio in your applications and open it. You'll see a chat-like interface.",
            success: true,
          },
        ],
      };
    }

    if (selectedTool === "gpt4all") {
      return {
        title: `Installing GPT4All`,
        intro: "GPT4All is designed to be the simplest option - just download and run.",
        steps: [
          {
            title: "Download GPT4All",
            description: "Click the button below to go to their website, then click the download button.",
            action: "download",
            downloadUrl: "https://gpt4all.io",
          },
          {
            title: "Install the app",
            description: os === "mac"
              ? "Open the downloaded file and drag GPT4All to your Applications folder."
              : "Run the downloaded installer and follow the prompts.",
          },
          {
            title: "Open GPT4All",
            description: "Find GPT4All in your applications and open it. It will download a basic AI model automatically.",
            success: true,
          },
        ],
      };
    }

    return {
      title: "Install Tool",
      intro: "Download and install the tool.",
      steps: [{ title: "Download from the official website", description: "" }],
    };
  };

  const instructions = getInstallInstructions();

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">{instructions.title}</h3>
        <p className="text-muted mb-6">{instructions.intro}</p>

        <ol className="space-y-6">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  step.success
                    ? "bg-green-100 text-green-700"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {step.success ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium mb-2">{step.title}</p>
                <p className="text-sm text-muted mb-3">{step.description}</p>

                {"action" in step && step.action === "download" && "downloadUrl" in step && step.downloadUrl && (
                  <a
                    href={step.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" className="mb-2">
                      <Download className="w-4 h-4" />
                      Go to Download Page
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}

                {"command" in step && step.command && (
                  <CodeBlock code={step.command} />
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Verification checkbox */}
        <div className="mt-8 pt-6 border-t border-border">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => setInstalled(!installed)}
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                installed
                  ? "bg-accent border-accent"
                  : "border-border hover:border-primary"
              }`}
            >
              {installed && <Check className="w-4 h-4 text-white" />}
            </button>
            <span className="font-medium">
              I've installed {tool?.name} and it's running
            </span>
          </label>
          <p className="text-sm text-muted mt-2 ml-10">
            Check this box when you're ready to continue
          </p>
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
  confirmedRam,
}: {
  selectedTool: string | null;
  selectedModel: string | null;
  onSelect: (model: string) => void;
  onNext: () => void;
  onPrev: () => void;
  confirmedRam?: number | null;
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
  const userRam = confirmedRam || 16;

  const getModelRecommendation = (modelId: string): { recommended: boolean; reason: string } => {
    if (userRam >= 16) {
      if (modelId === "llama-3.1-8b") return { recommended: true, reason: "Best for your computer" };
    } else if (userRam >= 8) {
      if (modelId === "llama-3.2-3b") return { recommended: true, reason: "Best for your computer" };
    }
    return { recommended: false, reason: "" };
  };

  const modelInfo: Record<string, { simple: string; goodFor: string; size: string }> = {
    "llama-3.2-3b": {
      simple: "Fast and lightweight - great for quick questions",
      goodFor: "Simple questions, brainstorming, basic help",
      size: "Small download (about 2GB)",
    },
    "llama-3.1-8b": {
      simple: "Smart and capable - the best balance",
      goodFor: "Most tasks: writing, questions, analysis, coding help",
      size: "Medium download (about 4.7GB)",
    },
    "mistral-7b": {
      simple: "Great for logical thinking and explanations",
      goodFor: "Detailed explanations, reasoning, analysis",
      size: "Medium download (about 4GB)",
    },
    "deepseek-coder-6.7b": {
      simple: "Specialized for programming and code",
      goodFor: "Writing code, debugging, technical questions",
      size: "Medium download (about 3.8GB)",
    },
  };

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Download an AI</h3>
        <p className="text-muted mb-4">
          Now we need to download an AI that will run on your computer.
          Think of this like downloading an app - you do it once and then
          it's yours forever.
        </p>

        {/* Explanation */}
        <div className="bg-background-alt rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">What does "{userRam}GB memory required" mean?</p>
              <p className="text-muted">
                Your computer needs at least that much memory to run the AI smoothly.
                Based on your computer ({userRam}GB), you can run any AI marked "{userRam}GB or less".
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {models.slice(0, 4).map((model) => {
            const info = modelInfo[model.id];
            const rec = getModelRecommendation(model.id);
            const ramNumber = parseInt(model.ramRequired.replace(/[^0-9]/g, '')) || 8;
            const canRun = userRam >= ramNumber;

            return (
              <button
                key={model.id}
                onClick={() => canRun && onSelect(model.id)}
                disabled={!canRun}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  !canRun
                    ? "border-border bg-gray-50 opacity-60 cursor-not-allowed"
                    : selectedModel === model.id
                    ? "border-primary bg-primary/5"
                    : rec.recommended
                    ? "border-primary/50 bg-primary/5 hover:border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{model.name}</span>
                      <Badge variant="default">{model.ramRequired} memory</Badge>
                      {rec.recommended && (
                        <Badge variant="primary">{rec.reason}</Badge>
                      )}
                      {!canRun && (
                        <Badge variant="default">Too big for your computer</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {info?.simple || model.description}
                    </p>
                    <p className="text-xs text-muted">
                      {info?.goodFor && <><strong>Good for:</strong> {info.goodFor}</>}
                    </p>
                    {info?.size && (
                      <p className="text-xs text-muted mt-1">{info.size}</p>
                    )}
                  </div>
                  {selectedModel === model.id ? (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-border flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedModel && selectedModelData && selectedTool === "ollama" && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium mb-4">How to download the AI</h4>

            {/* Terminal instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Step 1: Open Terminal (or PowerShell on Windows)
              </h5>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>On Mac:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">Command ⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">Space</kbd></li>
                  <li>Type "Terminal" and press Enter</li>
                  <li>A window with a text cursor will open - that's Terminal!</li>
                </ol>
                <p className="mt-3"><strong>On Windows:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Press the <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">Windows</kbd> key</li>
                  <li>Type "PowerShell" and click on it</li>
                  <li>A blue window will open - that's PowerShell!</li>
                </ol>
              </div>
            </div>

            <div className="bg-background-alt rounded-lg p-4 mb-4">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Step 2: Copy and paste this command
              </h5>
              <p className="text-sm text-muted mb-3">
                Click the copy button, then paste it into Terminal/PowerShell and press Enter:
              </p>
              <CodeBlock code={getDownloadCommand(selectedModelData.ollamaName)!} />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Step 3: Wait for the download</h5>
              <p className="text-sm text-green-800">
                You'll see a progress bar as the AI downloads. This might take a few minutes
                depending on your internet speed. When it's done, you'll be able to start chatting!
              </p>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setDownloaded(!downloaded)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    downloaded
                      ? "bg-accent border-accent"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {downloaded && <Check className="w-4 h-4 text-white" />}
                </button>
                <span className="font-medium">
                  The AI has downloaded and I can see a chat prompt
                </span>
              </label>
            </div>
          </div>
        )}

        {selectedModel && selectedTool !== "ollama" && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-muted">
              Open {tools.find((t) => t.id === selectedTool)?.name} and look for
              "{selectedModelData?.name}" in the model browser to download it.
            </p>
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setDownloaded(!downloaded)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    downloaded
                      ? "bg-accent border-accent"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {downloaded && <Check className="w-4 h-4 text-white" />}
                </button>
                <span className="font-medium">I've downloaded the AI</span>
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
          Finish Setup
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
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);
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
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">You Did It!</h2>
        <p className="text-muted max-w-md mx-auto">
          Your private AI is ready to use. Your conversations will never
          leave your computer - they're completely private.
        </p>
      </Card>

      {/* How to Use */}
      <Card className="border-2 border-primary">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">How to Chat with Your AI</h3>
        </div>

        {selectedTool === "ollama" ? (
          <div className="space-y-4">
            <div className="bg-background-alt rounded-lg p-4">
              <p className="font-medium mb-2">You're already in a chat!</p>
              <p className="text-sm text-muted mb-3">
                After running the download command, you should see a prompt waiting
                for your message. Just type your question and press <strong>Enter</strong>.
              </p>
              <div className="font-mono text-sm bg-foreground text-background rounded-lg p-4">
                <div className="text-gray-400 mb-2">{">>>"} <span className="text-white">What's the capital of France?</span></div>
                <div className="text-gray-300">The capital of France is Paris...</div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Try asking your AI:</h4>
              <div className="grid gap-2">
                {[
                  "Explain something complex in simple terms",
                  "Help me write a professional email",
                  "Give me ideas for dinner tonight",
                  "Summarize a long piece of text",
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
              <h4 className="font-medium mb-2">Useful tips:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <span className="font-mono bg-foreground/10 px-2 py-1 rounded text-xs flex-shrink-0">/bye</span>
                  <span className="text-muted">Type this to exit the chat</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono bg-foreground/10 px-2 py-1 rounded text-xs flex-shrink-0">ollama run {model?.ollamaName || "llama3.2"}</span>
                  <span className="text-muted">Run this command anytime to start a new chat</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted">
              Open {tool?.name} and start chatting! Your conversations are processed
              entirely on your computer - completely private.
            </p>
          </div>
        )}
      </Card>

      {/* Start Tomorrow / Coming Back Later */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Starting Your AI Tomorrow</h3>
        </div>

        {selectedTool === "ollama" ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-900 mb-2">Good news: Ollama runs automatically!</p>
              <p className="text-sm text-green-800">
                Ollama starts in the background whenever you turn on your computer.
                Look for the llama icon in your menu bar (Mac) or system tray (Windows) -
                if it's there, Ollama is ready to go.
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">To start a new chat:</h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span className="text-muted">Open Terminal (Mac) or PowerShell (Windows)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <div className="flex-1">
                    <span className="text-muted">Type this command and press Enter:</span>
                    <div className="mt-2">
                      <CodeBlock code={`ollama run ${model?.ollamaName || "llama3.2"}`} />
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span className="text-muted">Start chatting! The AI is already downloaded, so it will start instantly.</span>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-900 mb-2">Just open the app like any other program!</p>
              <p className="text-sm text-green-800">
                Find <strong>{tool?.name}</strong> in your Applications folder (Mac) or Start menu (Windows)
                and open it. Your AI model is already downloaded, so you can start chatting right away.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Troubleshooting */}
      <Card>
        <button
          onClick={() => setTroubleshootingOpen(!troubleshootingOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold">Having Problems?</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted transition-transform ${
              troubleshootingOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {troubleshootingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {selectedTool === "ollama" ? (
                  <>
                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        "Ollama won't start" or "Command not found"
                      </h4>
                      <div className="text-sm text-muted space-y-2">
                        <p>First, check if Ollama is running:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Look for the llama icon in your menu bar (Mac) or system tray (Windows)</li>
                          <li>If you don't see it, try restarting your computer</li>
                        </ul>
                        <p className="mt-2">If it still doesn't work, Ollama may need to be reinstalled:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Go to <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ollama.ai</a> and download it again</li>
                          <li>Follow the installation steps from the beginning</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        "Download stuck" or "Connection error"
                      </h4>
                      <div className="text-sm text-muted space-y-2">
                        <p>If the AI model download gets stuck:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Check your internet connection</li>
                          <li>Press <kbd className="px-1.5 py-0.5 bg-background-alt rounded border text-xs">Ctrl+C</kbd> to cancel the download</li>
                          <li>Try again with: <code className="bg-background-alt px-1.5 py-0.5 rounded text-xs">ollama pull {model?.ollamaName || "llama3.2"}</code></li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        "Responses are very slow"
                      </h4>
                      <div className="text-sm text-muted space-y-2">
                        <p>This is normal behavior in some cases:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>The first response is always slower while the AI "warms up"</li>
                          <li>Longer questions take more time to process</li>
                          <li>If it's consistently slow, your computer may need more RAM</li>
                        </ul>
                        <p className="mt-2">
                          Try a smaller model like <strong>Llama 3.2 3B</strong> - it's faster and uses less memory.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        "I closed the app, how do I get back?"
                      </h4>
                      <div className="text-sm text-muted">
                        <p>
                          Just open <strong>{tool?.name}</strong> again from your Applications folder (Mac)
                          or Start menu (Windows). Your downloaded AI models will still be there.
                        </p>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        "Responses are very slow"
                      </h4>
                      <div className="text-sm text-muted space-y-2">
                        <p>This is normal in some cases:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>The first response is always slower while the AI "warms up"</li>
                          <li>Your computer may need more RAM for larger models</li>
                        </ul>
                        <p className="mt-2">
                          Try downloading a smaller model - look for one with lower memory requirements.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                    "I want to try a different AI model"
                  </h4>
                  <div className="text-sm text-muted">
                    {selectedTool === "ollama" ? (
                      <div className="space-y-2">
                        <p>You can download and try any model! Here are some popular ones:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><code className="bg-background-alt px-1.5 py-0.5 rounded text-xs">ollama run llama3.2</code> - Fast, lightweight</li>
                          <li><code className="bg-background-alt px-1.5 py-0.5 rounded text-xs">ollama run llama3.1</code> - Smarter, best balance</li>
                          <li><code className="bg-background-alt px-1.5 py-0.5 rounded text-xs">ollama run mistral</code> - Great for reasoning</li>
                        </ul>
                        <p className="mt-2">
                          Each new model needs to download once, then it's saved on your computer.
                        </p>
                      </div>
                    ) : (
                      <p>
                        Open the model browser in <strong>{tool?.name}</strong> to see all available models.
                        You can download and switch between different ones anytime.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* What's Next */}
      <Card>
        <h3 className="font-semibold mb-3">What's Next?</h3>
        <div className="space-y-3 text-sm text-muted">
          <p>
            <strong>Try different questions</strong> - The AI can help with writing,
            brainstorming, explanations, and much more.
          </p>
          <p>
            <strong>It learns your style</strong> - The more context you give in your
            questions, the better the responses will be.
          </p>
          <p>
            <strong>It's private</strong> - Feel free to ask about sensitive topics.
            Nothing leaves your computer.
          </p>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
        <Link href="/learn">
          <Button>
            Learn More About How This Works
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SetupPageContent />
    </Suspense>
  );
}
