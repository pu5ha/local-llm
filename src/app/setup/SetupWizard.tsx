"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Download,
  Terminal,
  MessageSquare,
  ExternalLink,
  Cpu,
  HelpCircle,
  AlertCircle,
  Check,
  ChevronDown,
  RefreshCw,
  Zap,
  HardDrive,
} from "lucide-react";
import { Button, Card, Badge, CodeBlock } from "@/components/ui";
import useHardwareDetection from "@/hooks/useHardwareDetection";
import { tools } from "@/data/tools";
import type { Model } from "@/lib/catalog/types";
import { getRecommendedModel } from "@/lib/catalog/recommend";

type Step = "tool" | "install" | "model" | "complete";

const stepOrder: Step[] = ["tool", "install", "model", "complete"];

const stepInfo = {
  tool: { title: "Choose App", icon: Download },
  install: { title: "Install", icon: Terminal },
  model: { title: "Download AI", icon: Cpu },
  complete: { title: "Done!", icon: MessageSquare },
};

function SetupWizardContent({ models }: { models: Model[] }) {
  const searchParams = useSearchParams();
  const ramFromUrl = searchParams.get("ram");
  const confirmedRam = ramFromUrl ? parseInt(ramFromUrl, 10) : null;

  const [currentStep, setCurrentStep] = useState<Step>("tool");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const { hardware } = useHardwareDetection();

  const featuredModels = useMemo(() => models.filter((m) => m.featured), [models]);

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
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
            Set Up Your <span className="text-primary">Private AI</span>
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
          <div className="flex items-center">
            {stepOrder.map((step, index) => {
              const StepIcon = stepInfo[step].icon;
              const isActive = step === currentStep;
              const isCompleted = completedSteps.includes(step);
              const isClickable =
                index <= currentIndex || completedSteps.includes(step);

              return (
                <div key={step} className={`flex items-center ${index < stepOrder.length - 1 ? 'flex-1' : ''}`}>
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
                          ? "bg-secondary-pale border-2 border-dashed border-secondary rotate-[-4deg] text-[color:var(--tag-amber-text)]"
                          : "bg-card border border-border text-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 rotate-[4deg]" />
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
                      className={`flex-1 h-0.5 mx-3 ${
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
            {currentStep === "tool" && (
              <StepTool
                selectedTool={selectedTool}
                onSelect={setSelectedTool}
                onNext={goNext}
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
                models={featuredModels}
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
                models={featuredModels}
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

function StepTool({
  selectedTool,
  onSelect,
  onNext,
}: {
  selectedTool: string | null;
  onSelect: (tool: string) => void;
  onNext: () => void;
}) {
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const beginnerTools = tools.filter((t) => t.difficulty === "beginner");
  const otherTools = beginnerTools.filter((t) => t.id !== "ollama");

  // Auto-select Ollama on mount if nothing selected
  useEffect(() => {
    if (!selectedTool) {
      onSelect("ollama");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toolDetails: Record<string, { description: string; bestFor: string }> = {
    "lm-studio": {
      description: "A visual app that looks similar to ChatGPT. Point and click interface.",
      bestFor: "People who prefer clicking buttons over typing commands",
    },
    "gpt4all": {
      description: "A simple app focused on privacy. Clean chat interface with basic features.",
      bestFor: "Simple needs and complete beginners",
    },
  };

  // If Ollama is selected (default), show simplified view
  const isOllamaSelected = selectedTool === "ollama" || !selectedTool;

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">We recommend Ollama</h3>
        <p className="text-muted mb-6">
          To run AI privately, you need an app on your computer. Ollama is the most
          popular option - it works just like ChatGPT and saves your conversations.
        </p>

        {/* Ollama recommendation card */}
        <div
          className={`p-5 rounded-lg border-2 transition-colors ${
            isOllamaSelected
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 cursor-pointer"
          }`}
          onClick={() => !isOllamaSelected && onSelect("ollama")}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isOllamaSelected ? "bg-primary text-white" : "bg-background-alt"
            }`}>
              <Terminal className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-lg">Ollama</span>
                <Badge variant="primary">Recommended</Badge>
              </div>
              <p className="text-muted mb-3">
                The most popular way to run AI. Has a familiar chat interface just like
                ChatGPT - with saved conversations.
              </p>
              <ul className="space-y-1 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Works just like ChatGPT
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Saves your conversation history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Easy to use from menu bar
                </li>
              </ul>
            </div>
            {isOllamaSelected && (
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Other options toggle */}
        {!showOtherOptions ? (
          <button
            onClick={() => setShowOtherOptions(true)}
            className="mt-4 text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronDown className="w-4 h-4" />
            See other options
          </button>
        ) : (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted mb-3">Other options:</p>
            <div className="space-y-3">
              {otherTools.map((tool) => {
                const details = toolDetails[tool.id];
                const isSelected = selectedTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelect(tool.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-background-alt"
                      }`}>
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">{tool.name}</span>
                        <p className="text-sm text-muted mt-1">{details?.description || tool.tagline}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={!selectedTool}>
          Use {selectedTool === "ollama" || !selectedTool ? "Ollama" : tools.find(t => t.id === selectedTool)?.name}
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
          intro: "Just like installing any other app - download, install, done!",
          steps: [
            {
              title: "Download Ollama",
              description: "Click below to download Ollama. It will save a file to your Downloads folder.",
              action: "download",
              downloadUrl: "https://ollama.ai/download/mac",
            },
            {
              title: "Install it",
              description: "Open the downloaded file and drag Ollama to your Applications folder. Then open it from Applications. If you see a security warning, click \"Open\" to continue.",
            },
            {
              title: "Look for the llama icon",
              description: "You'll see a small llama icon appear in your menu bar (top-right of your screen). That means it's running!",
              success: true,
            },
          ],
        };
      } else if (os === "windows") {
        return {
          title: "Installing Ollama on Windows",
          intro: "Just like installing any other app - download, install, done!",
          steps: [
            {
              title: "Download Ollama",
              description: "Click below to download the Ollama installer.",
              action: "download",
              downloadUrl: "https://ollama.ai/download/windows",
            },
            {
              title: "Run the installer",
              description: "Open the downloaded file (OllamaSetup.exe) and click through the installer. It takes about a minute.",
            },
            {
              title: "Look for the llama icon",
              description: "After installation, you'll see a llama icon in your system tray (bottom-right). That means it's running!",
              success: true,
            },
          ],
        };
      } else {
        return {
          title: "Installing Ollama on Linux",
          intro: "One command installs everything:",
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
  models,
  selectedTool,
  selectedModel,
  onSelect,
  onNext,
  onPrev,
  confirmedRam,
}: {
  models: Model[];
  selectedTool: string | null;
  selectedModel: string | null;
  onSelect: (model: string) => void;
  onNext: () => void;
  onPrev: () => void;
  confirmedRam?: number | null;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [showOtherModels, setShowOtherModels] = useState(false);
  const [selectedRam, setSelectedRam] = useState<number | null>(confirmedRam ?? null);
  const [showRamHelp, setShowRamHelp] = useState(false);
  const { hardware } = useHardwareDetection();
  const userRam = selectedRam || 16;
  const hasDiscreteGpu = hardware.gpuType === "nvidia" || hardware.gpuType === "amd";

  const { primary: recommendedModel } = getRecommendedModel(models, {
    ramGB: userRam,
    hasDiscreteGpu,
  });
  const recommendedModelId = recommendedModel?.id ?? null;

  // Auto-select recommended model on mount
  useEffect(() => {
    if (!selectedModel && recommendedModelId) {
      onSelect(recommendedModelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedModelId]);

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const otherModels = models
    .filter((m) => m.id !== recommendedModelId)
    .slice(0, 4);

  // If RAM isn't selected yet, show RAM selection first
  if (!selectedRam) {
    return (
      <div>
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">How much RAM does your computer have?</h3>
              <p className="text-sm text-muted">This helps us recommend the right AI model for you</p>
            </div>
          </div>

          {/* RAM Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[8, 16, 32, 64].map((ram) => {
              const isSuggested = ram === hardware.suggestedRam;
              return (
                <button
                  key={ram}
                  onClick={() => setSelectedRam(ram)}
                  className={`relative py-4 px-3 rounded-xl border-2 font-semibold text-lg transition-all cursor-pointer hover:scale-[1.02] ${
                    isSuggested
                      ? "border-primary bg-primary text-white hover:bg-primary/90 shadow-md"
                      : "border-border bg-white hover:border-primary hover:shadow-sm"
                  }`}
                >
                  {ram}GB
                  {isSuggested && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                      likely yours
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Help toggle */}
          <button
            onClick={() => setShowRamHelp(!showRamHelp)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted hover:text-foreground transition-colors rounded-lg border border-border hover:border-primary/30 bg-background-alt"
          >
            <HelpCircle className="w-4 h-4" />
            Not sure? Here's how to check
            <ChevronDown className={`w-4 h-4 transition-transform ${showRamHelp ? 'rotate-180' : ''}`} />
          </button>

          {/* Collapsible Instructions */}
          {showRamHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 bg-background-alt rounded-xl p-4 border border-border"
            >
              {hardware.os === "mac" ? (
                <div>
                  <p className="font-medium mb-3 text-sm">Find your RAM on Mac:</p>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-3">
                      <span className="step-number w-5 h-5 text-xs">1</span>
                      <span>Click the <strong>Apple logo </strong> in the top-left corner</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="step-number w-5 h-5 text-xs">2</span>
                      <span>Click <strong>"About This Mac"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="step-number w-5 h-5 text-xs">3</span>
                      <span>Look for <strong>"Memory"</strong> — it shows your RAM (8GB, 16GB, etc.)</span>
                    </li>
                  </ol>
                </div>
              ) : hardware.os === "windows" ? (
                <div>
                  <p className="font-medium mb-3 text-sm">Find your RAM on Windows:</p>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-3">
                      <span className="step-number w-5 h-5 text-xs">1</span>
                      <span>Press <strong>Windows key + I</strong> to open Settings</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="step-number w-5 h-5 text-xs">2</span>
                      <span>Click <strong>System</strong> → <strong>About</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="step-number w-5 h-5 text-xs">3</span>
                      <span>Look for <strong>"Installed RAM"</strong> (ignore decimals: 15.8GB = 16GB)</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div>
                  <p className="font-medium mb-3 text-sm">Find your RAM:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium">Mac:</span>
                      <span className="text-muted">Apple menu → About This Mac → Memory</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Windows:</span>
                      <span className="text-muted">Settings → System → About → Installed RAM</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Linux:</span>
                      <span className="text-muted">Run <code className="bg-white px-1 rounded">free -h</code> in terminal</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </Card>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            We recommend {recommendedModel?.name} for your computer
          </h3>
          <button
            onClick={() => setSelectedRam(null)}
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Change RAM ({userRam}GB)
          </button>
        </div>

        {/* "Printed output" moment - makes the recommendation feel like the app is actually working */}
        <div className="terminal mb-5">
          <div className="terminal-header">
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
          </div>
          <div className="terminal-body text-sm">
            <span className="terminal-prompt">$</span>{" "}
            <span className="terminal-command">detect-hardware</span>
            <br />
            <span className="terminal-output">→ {userRam}GB RAM found</span>
            <br />
            <span className="terminal-output">
              → Recommended model: {recommendedModel?.name ?? "none"}{" "}
              <span className="text-terminal-green">✓</span>
            </span>
          </div>
        </div>

        {/* Recommended model card */}
        {recommendedModel && (
          <div
            className={`p-5 rounded-lg border-2 transition-colors ${
              selectedModel === recommendedModelId
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 cursor-pointer"
            }`}
            onClick={() => selectedModel !== recommendedModelId && recommendedModelId && onSelect(recommendedModelId)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                selectedModel === recommendedModelId ? "bg-primary text-white" : "bg-background-alt"
              }`}>
                <Cpu className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">{recommendedModel.name}</span>
                  <Badge variant="primary">Best for your computer</Badge>
                </div>
                <p className="text-muted mb-3">{recommendedModel.description}</p>
                <ul className="space-y-1 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Good for: {recommendedModel.bestFor.join(", ")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    {recommendedModel.parameters} model, needs about {recommendedModel.ramRequired} of RAM
                  </li>
                </ul>
              </div>
              {selectedModel === recommendedModelId && (
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
              )}
            </div>
          </div>
        )}

        {/* Other models toggle */}
        {!showOtherModels ? (
          <button
            onClick={() => setShowOtherModels(true)}
            className="mt-4 text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronDown className="w-4 h-4" />
            Choose a different model
          </button>
        ) : (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted mb-3">Other options:</p>
            <div className="space-y-3">
              {otherModels.map((model) => {
                const canRun = userRam >= model.ramRequiredGB;
                const isSelected = selectedModel === model.id;

                return (
                  <button
                    key={model.id}
                    onClick={() => canRun && onSelect(model.id)}
                    disabled={!canRun}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      !canRun
                        ? "border-border bg-gray-50 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-background-alt"
                      }`}>
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold">{model.name}</span>
                          <Badge variant="default">{model.ramRequired} memory</Badge>
                          {!canRun && (
                            <Badge variant="default">Too big for your computer</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted">{model.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Download instructions - show when model is selected */}
        {selectedModel && selectedModelData && selectedTool === "ollama" && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium mb-4">Download {selectedModelData.name} to your computer</h4>

            {/* Simple 2-step process */}
            <div className="space-y-4">
              {/* Step 1: Open Ollama */}
              <div className="bg-background-alt rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">1</span>
                  <div className="flex-1">
                    <p className="font-medium mb-2">Open Ollama</p>
                    <p className="text-sm text-muted mb-3">
                      Click the <strong>llama icon</strong> in your menu bar (Mac) or system tray (Windows), then click <strong>"Open Ollama"</strong>.
                    </p>
                    {/* Visual representation of menu bar */}
                    <div className="bg-white border border-border rounded-lg p-3 inline-block">
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>Menu bar:</span>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
                          <span>📶</span>
                          <span>🔋</span>
                          <span className="bg-primary/20 px-1.5 py-0.5 rounded font-medium text-primary">🦙 ← click this</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Type model name */}
              <div className="bg-primary-pale rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">2</span>
                  <div className="flex-1">
                    <p className="font-medium mb-2">Type the model name and press Enter</p>
                    <p className="text-sm text-muted mb-3">
                      In the Ollama chat window, type exactly this:
                    </p>
                    <CodeBlock code={selectedModelData.ollamaName || "llama3.2"} />
                    {/* Visual representation of chat */}
                    <div className="mt-3 bg-white border border-border rounded-lg p-3">
                      <div className="text-xs text-muted mb-2 pb-2 border-b border-border flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Ollama Chat Preview
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-primary/10 rounded-lg p-2 text-primary font-mono text-xs">
                          {selectedModelData.ollamaName || "llama3.2"}
                        </div>
                        <div className="bg-background-alt rounded-lg p-2 text-muted text-xs">
                          ⏳ Downloading {selectedModelData.name}... 45%
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-3">
                      The download will start automatically. It may take a few minutes depending on your internet speed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Success indicator */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 mb-1">When the download finishes</p>
                    <p className="text-sm text-green-800">
                      You'll see a response from the AI. That means you're ready to chat!
                      Your conversations are saved automatically.
                    </p>
                  </div>
                </div>
              </div>
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
                  The AI is downloaded and I can chat with it
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
  models,
  selectedTool,
  selectedModel,
}: {
  models: Model[];
  selectedTool: string | null;
  selectedModel: string | null;
}) {
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);
  const [tomorrowOpen, setTomorrowOpen] = useState(false);
  const tool = tools.find((t) => t.id === selectedTool);
  const model = models.find((m) => m.id === selectedModel);
  const smallestModel = [...models].sort((a, b) => a.parametersB - b.parametersB)[0];

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
        <p className="text-muted max-w-md mx-auto mb-6">
          Your private AI is ready to use. Your conversations will never
          leave your computer - they're completely private.
        </p>

        {/* Prominent Open Ollama button */}
        {selectedTool === "ollama" && (
          <div className="bg-primary-pale rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-sm text-muted mb-3">Ready to chat? Open Ollama now:</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted">Click the</span>
              <span className="bg-white border border-border px-2 py-1 rounded font-medium">🦙 llama icon</span>
              <span className="text-muted">in your menu bar</span>
            </div>
          </div>
        )}
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
              <p className="font-medium mb-2">Just like ChatGPT - but private!</p>
              <p className="text-sm text-muted mb-3">
                The Ollama chat window works just like ChatGPT. Type your message
                at the bottom and press <strong>Enter</strong> to send.
              </p>
              <div className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-xs text-muted mb-3 pb-2 border-b border-border">
                  <MessageSquare className="w-3 h-3" />
                  <span>Ollama Chat</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-primary/10 rounded-lg p-2 ml-8">What's the capital of France?</div>
                  <div className="bg-background-alt rounded-lg p-2 mr-8">The capital of France is Paris...</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Your chats are saved!
              </h4>
              <p className="text-sm text-green-800">
                Unlike the old terminal method, Ollama's chat window saves your conversation history.
                Come back anytime and pick up where you left off.
              </p>
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

      {/* Start Tomorrow / Coming Back Later - Collapsible */}
      <Card>
        <button
          onClick={() => setTomorrowOpen(!tomorrowOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Coming Back Tomorrow?</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted transition-transform ${
              tomorrowOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {tomorrowOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
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
                      <h4 className="font-medium mb-3">To open your chats:</h4>
                      <ol className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                          <span className="text-muted">Click the <strong>llama icon</strong> in your menu bar (Mac) or system tray (Windows)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                          <span className="text-muted">Click <strong>"Open Ollama"</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                          <span className="text-muted">Your previous chats will be there - just continue where you left off!</span>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                        "I can't find the llama icon"
                      </h4>
                      <div className="text-sm text-muted space-y-2">
                        <p>First, check if Ollama is running:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Look for the llama icon in your menu bar (Mac) or system tray (Windows)</li>
                          <li>If you don't see it, try restarting your computer</li>
                        </ul>
                        <p className="mt-2">If it still doesn't appear, Ollama may need to be reinstalled:</p>
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
                          <li>Close the Ollama chat window and open it again</li>
                          <li>Try downloading the model again by typing its name</li>
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
                        {smallestModel && (
                          <p className="mt-2">
                            Try a smaller model like <strong>{smallestModel.name}</strong> - it's faster and uses less memory.
                          </p>
                        )}
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
                        <p>You can download and try any model! In the Ollama chat window, just type the model name:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          {models.map((m) => (
                            <li key={m.id}>
                              <code className="bg-background-alt px-1.5 py-0.5 rounded text-xs">
                                {m.ollamaName}
                              </code>{" "}
                              - {m.description}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2">
                          Each new model downloads once, then it's saved on your computer. You can switch between models anytime.
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

      {/* What's Next - Compact footer */}
      <div className="bg-background-alt rounded-xl p-4 text-center">
        <p className="text-sm text-muted mb-3">
          <strong>Tip:</strong> The more context you give, the better the responses.
          Feel free to ask about sensitive topics - nothing leaves your computer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="secondary" className="text-sm">Back to Home</Button>
          </Link>
          <Link href="/help">
            <Button variant="ghost" className="text-sm">
              Need Help?
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SetupWizard({ models }: { models: Model[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SetupWizardContent models={models} />
    </Suspense>
  );
}
