"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Download,
  Terminal,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button, Card, Badge, CodeBlock } from "@/components/ui";
import useHardwareDetection from "@/hooks/useHardwareDetection";
import { getImageToolById, getToolRecommendations } from "@/data/imageTools";
import { imageModels, getRecommendationForVram } from "@/data/imageModels";

type Step = "tool" | "install" | "model" | "complete";

const stepOrder: Step[] = ["tool", "install", "model", "complete"];

const stepInfo = {
  tool: { title: "Choose Tool", icon: Download },
  install: { title: "Install", icon: Terminal },
  model: { title: "Choose Model", icon: ImageIcon },
  complete: { title: "Create!", icon: Sparkles },
};

const tierColorClass: Record<string, string> = {
  basic: "tag-green",
  standard: "tag-amber",
  high: "tag-blue",
  power: "tag-violet",
};

const tierEmoji: Record<string, string> = {
  basic: "🟢",
  standard: "🟡",
  high: "🔵",
  power: "🟣",
};

export default function ImageSetupWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("tool");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
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
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">
            Set Up Private <span className="text-primary">Image Creation</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            We&apos;ll walk you through every step. In a few minutes, you&apos;ll be
            creating images from text descriptions - all on your own computer.
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
                <div key={step} className={`flex items-center ${index < stepOrder.length - 1 ? "flex-1" : ""}`}>
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
                        completedSteps.includes(step) ? "bg-accent" : "bg-border"
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
              <StepModel selectedTool={selectedTool} onNext={goNext} onPrev={goPrev} />
            )}
            {currentStep === "complete" && <StepComplete selectedTool={selectedTool} />}
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
  const { hardware, imageRecommendations } = useHardwareDetection();
  const isAppleSilicon = hardware.gpuType === "apple" || hardware.isAppleSilicon;

  const recommendations = getToolRecommendations(
    hardware.estimatedVram,
    false,
    true,
    isAppleSilicon,
    hardware.os
  );
  const topToolId = recommendations[0]?.toolId ?? "fooocus";
  const topTool = getImageToolById(topToolId);
  const otherRecommendations = recommendations.slice(1, 4);

  // Auto-select the top recommendation once hardware detection finishes
  useEffect(() => {
    if (!selectedTool && !hardware.isLoading) {
      onSelect(topToolId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardware.isLoading, topToolId]);

  const isTopSelected = selectedTool === topToolId || !selectedTool;

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Can your computer create AI images?</h3>
        <p className="text-muted mb-4">
          Image generation needs a graphics card (GPU) with its own memory - let&apos;s check what you have.
        </p>

        {/* Hardware detection reveal */}
        <div className="terminal mb-5">
          <div className="terminal-header">
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
          </div>
          <div className="terminal-body text-sm">
            {hardware.isLoading ? (
              <span className="terminal-output">Detecting your hardware...</span>
            ) : (
              <>
                <span className="terminal-prompt">$</span>{" "}
                <span className="terminal-command">detect-gpu</span>
                <br />
                <span className="terminal-output">
                  →{" "}
                  {isAppleSilicon
                    ? "Apple Silicon detected (unified memory)"
                    : hardware.gpu || "No dedicated GPU detected"}
                </span>
                <br />
                <span className="terminal-output">
                  →{" "}
                  {hardware.estimatedVram
                    ? `~${hardware.estimatedVram}GB available for images`
                    : "Amount of usable memory unknown"}{" "}
                  {imageRecommendations.canRun && (
                    <span className="text-terminal-green">✓</span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {!hardware.isLoading && !imageRecommendations.canRun && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              We couldn&apos;t detect a compatible graphics card, but you might still be able
              to create images - continue below to find out.
            </p>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">How do you want to create images?</h3>
        <p className="text-muted mb-4">
          These tools let you type a description and get an image back.
        </p>

        {topTool && (
          <div
            className={`p-5 rounded-lg border-2 transition-colors ${
              isTopSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 cursor-pointer"
            }`}
            onClick={() => !isTopSelected && onSelect(topToolId)}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isTopSelected ? "bg-primary text-white" : "bg-background-alt"
                }`}
              >
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-lg">{topTool.name}</span>
                  <Badge variant="primary">Recommended</Badge>
                  {topTool.modelIncluded && <Badge variant="default">Model included</Badge>}
                </div>
                <p className="text-muted mb-2">{topTool.simpleDescription}</p>
                <p className="text-sm text-muted">{recommendations[0]?.reason}</p>
              </div>
              {isTopSelected && (
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
              )}
            </div>
          </div>
        )}

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
              {otherRecommendations.map((rec) => {
                const tool = getImageToolById(rec.toolId);
                if (!tool) return null;
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
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-primary text-white" : "bg-background-alt"
                        }`}
                      >
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">{tool.name}</span>
                        <p className="text-sm text-muted mt-1">{tool.simpleDescription}</p>
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
          Use {getImageToolById(selectedTool || "")?.name || topTool?.name}
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
  const tool = getImageToolById(selectedTool || "");

  const getInstallInstructions = () => {
    if (selectedTool === "mochi-diffusion") {
      return {
        title: "Install Mochi Diffusion",
        steps: [
          {
            text: "Download Mochi Diffusion",
            detail:
              "Click below. On the page that opens, scroll down to \"Assets\" and click the file ending in .dmg.",
          },
          {
            text: "Install the app",
            detail:
              "Find the downloaded .dmg file in your Downloads folder and drag the Mochi Diffusion icon onto the Applications folder icon.",
          },
          {
            text: "Open Mochi Diffusion",
            detail:
              "Go to Applications (Finder → Go → Applications) and double-click Mochi Diffusion. If you see an \"unidentified developer\" warning, right-click the app, choose \"Open\", then click \"Open\" again.",
          },
        ],
        downloadUrl: "https://github.com/MochiDiffusion/MochiDiffusion/releases",
      };
    }

    if (selectedTool === "draw-things") {
      return {
        title: "Install Draw Things",
        steps: [
          {
            text: "Open the Mac App Store link",
            detail: "Click below - it opens the App Store directly to Draw Things.",
          },
          {
            text: "Click \"Get\" to install",
            detail: "Click the blue \"Get\" button, then \"Install\". You may need to sign in with your Apple ID.",
          },
          {
            text: "Open Draw Things",
            detail: "Click \"Open\" in the App Store, or find it in your Applications folder.",
          },
        ],
        downloadUrl: "https://apps.apple.com/app/draw-things-ai-generation/id6444050820",
      };
    }

    if (selectedTool === "diffusionbee") {
      return {
        title: "Install DiffusionBee",
        steps: [
          {
            text: "Download DiffusionBee",
            detail: "Click below, then click the \"Download\" button for Mac. The file is about 2GB.",
          },
          {
            text: "Install the app",
            detail: "Find the downloaded .dmg file in your Downloads folder and drag DiffusionBee onto the Applications folder.",
          },
          {
            text: "Open DiffusionBee",
            detail: "Go to Applications and double-click DiffusionBee. If you see a security warning, right-click, choose \"Open\", then \"Open\" again.",
          },
          {
            text: "Wait for setup to complete",
            detail: "The first time you open it, DiffusionBee downloads and sets up its included AI model automatically - just wait a few minutes.",
          },
        ],
        downloadUrl: "https://diffusionbee.com",
      };
    }

    if (selectedTool === "fooocus") {
      if (os === "windows") {
        return {
          title: "Install Fooocus on Windows",
          steps: [
            {
              text: "Download Fooocus",
              detail: "Click below and look for \"Fooocus_win64_xxx.7z\" (the latest version).",
            },
            {
              text: "Extract the downloaded file",
              detail: "Right-click the .7z file and choose \"Extract All\" (you may need 7-Zip).",
            },
            {
              text: "Run Fooocus",
              detail: "Open the extracted folder and double-click \"run.bat\". A window opens and downloads the AI model (a few minutes the first time).",
            },
            {
              text: "Wait for your browser to open",
              detail: "Fooocus opens automatically in your browser when ready.",
            },
          ],
          downloadUrl: "https://github.com/lllyasviel/Fooocus/releases",
        };
      } else if (os === "mac") {
        return {
          title: "Install Fooocus on macOS",
          steps: [
            {
              text: "Install Homebrew (if you don't have it)",
              detail: "Open Terminal and paste this command:",
              command:
                '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
            },
            {
              text: "Install Python and Git",
              detail: "In Terminal, run:",
              command: "brew install python git",
            },
            {
              text: "Download and run Fooocus",
              detail: "In Terminal, run:",
              command:
                "git clone https://github.com/lllyasviel/Fooocus.git && cd Fooocus && python3 -m pip install -r requirements_versions.txt && python3 entry_with_update.py",
            },
            {
              text: "Wait for your browser to open",
              detail: "Fooocus downloads the AI model and opens in your browser when ready.",
            },
          ],
          downloadUrl: null,
        };
      } else {
        return {
          title: "Install Fooocus on Linux",
          steps: [
            {
              text: "Install Python and Git",
              detail: "Open Terminal and run:",
              command: "sudo apt install python3 python3-pip git",
            },
            {
              text: "Download and run Fooocus",
              detail: "In Terminal, run:",
              command:
                "git clone https://github.com/lllyasviel/Fooocus.git && cd Fooocus && pip3 install -r requirements_versions.txt && python3 entry_with_update.py",
            },
            {
              text: "Wait for your browser to open",
              detail: "Fooocus downloads the AI model and opens in your browser when ready.",
            },
          ],
          downloadUrl: null,
        };
      }
    }

    if (selectedTool === "forge") {
      return {
        title: `Install SD WebUI Forge`,
        steps: [
          { text: "Download Forge", detail: "Look for the portable package on the releases page." },
          { text: "Extract and run", detail: "Run the included update/run script for your OS." },
          { text: "Wait for your browser to open", detail: "Forge opens in your browser when ready. You'll pick a model in the next step." },
        ],
        downloadUrl: "https://github.com/lllyasviel/stable-diffusion-webui-forge/releases",
      };
    }

    if (selectedTool === "comfyui") {
      return {
        title: `Install ComfyUI`,
        steps: [
          { text: "Download ComfyUI from GitHub", detail: "Look for the portable version if you're on Windows." },
          { text: "Extract and run ComfyUI", detail: null },
          { text: "Download a model separately", detail: "We'll help with this in the next step." },
        ],
        downloadUrl: "https://github.com/comfyanonymous/ComfyUI/releases",
      };
    }

    return {
      title: "Install Tool",
      steps: [{ text: "Download from the official website", detail: null }],
      downloadUrl: tool?.website,
    };
  };

  const instructions = getInstallInstructions();

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">{instructions.title}</h3>
        <p className="text-muted mb-6">Follow these steps to install {tool?.name} on your computer.</p>

        {instructions.downloadUrl && (
          <a href={instructions.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block mb-6">
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Go to Download Page
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        )}

        <ol className="space-y-6">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">{step.text}</p>
                {step.detail && <p className="text-sm text-muted mb-2">{step.detail}</p>}
                {"command" in step && step.command && <CodeBlock code={step.command} />}
              </div>
            </li>
          ))}
        </ol>

        {(selectedTool === "fooocus" || selectedTool === "diffusionbee") && (
          <div className="mt-6 bg-primary-pale rounded-lg p-4">
            <p className="text-sm">
              <strong>Good news!</strong> {tool?.name} comes with an AI model already included -
              you&apos;ll be ready to generate images right after install.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => setInstalled(!installed)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                installed ? "bg-accent border-accent" : "border-border hover:border-primary"
              }`}
            >
              {installed && <Check className="w-4 h-4 text-white" />}
            </button>
            <span>I&apos;ve installed {tool?.name} and it&apos;s running</span>
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
  onNext,
  onPrev,
}: {
  selectedTool: string | null;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { hardware } = useHardwareDetection();
  const vram = hardware.estimatedVram;
  const tool = getImageToolById(selectedTool || "");
  const vramRec = vram ? getRecommendationForVram(vram) : null;

  // Bundled-model tools - nothing to choose
  if (selectedTool === "diffusionbee" || selectedTool === "fooocus") {
    const modelName = selectedTool === "diffusionbee" ? "Stable Diffusion" : "SDXL";
    return (
      <div>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Your AI Model</h3>
          <div className="bg-primary-pale rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">
                {tool?.name} already includes a model!
              </span>
            </div>
            <p className="text-sm text-muted">
              {modelName} is bundled in - you can start generating images right away, no
              extra downloads needed.
            </p>
          </div>
        </Card>
        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Mac-native apps needing a Core ML model download
  if (selectedTool === "mochi-diffusion" || selectedTool === "draw-things") {
    const appName = selectedTool === "mochi-diffusion" ? "Mochi Diffusion" : "Draw Things";
    return (
      <div>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Download a Model</h3>
          <p className="text-muted mb-4">
            {appName} needs a model to generate images. Mac apps like this use special
            &quot;Core ML&quot; versions of models that run faster on Apple Silicon.
          </p>

          {selectedTool === "draw-things" ? (
            <div className="bg-primary-pale rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Draw Things downloads models for you!</span>
              </div>
              <p className="text-sm text-muted mb-2">
                Go to <strong>Settings → Models</strong> in the app to browse and download. Popular options:
              </p>
              <ul className="text-sm space-y-1">
                <li>• <strong>Dreamshaper</strong> - Artistic, creative styles</li>
                <li>• <strong>Juggernaut</strong> - Realistic images</li>
                <li>• <strong>Playground 2.5</strong> - High quality, general purpose</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-background-alt rounded-lg p-4 space-y-3">
                <div>
                  <p className="font-medium text-sm mb-1">1. Open the model download page</p>
                  <a
                    href="https://huggingface.co/coreml-community/coreml-stable-diffusion-2-1-base/tree/main"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Stable Diffusion 2.1 model page
                  </a>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">2. Download the model file</p>
                  <p className="text-sm text-muted">
                    Look for <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-xs">split_einsum_v2_compiled.zip</code> and download it (~2.5GB).
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">3. Unzip and move it into place</p>
                  <p className="text-sm text-muted">
                    Unzip the file, then in Finder press <strong>Cmd+Shift+G</strong>, paste{" "}
                    <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-xs">~/Documents/MochiDiffusion/models</code>,
                    and drag your unzipped folder there.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">4. Restart Mochi Diffusion</p>
                  <p className="text-sm text-muted">Your model will now appear in the model dropdown.</p>
                </div>
              </div>
              <div className="bg-primary-pale rounded-lg p-3">
                <p className="text-sm">
                  <strong>Tip:</strong> Stable Diffusion 2.1 is a solid, well-tested starting point -
                  you can add more models later.
                </p>
              </div>
            </div>
          )}
        </Card>
        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Forge, ComfyUI, and anything else - VRAM-tier-based recommendation
  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Choose Your AI Model</h3>
        <p className="text-muted mb-4">
          Different models produce different quality and speed. Here&apos;s what fits your hardware.
        </p>

        {vramRec && (
          <div className="terminal mb-5">
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
            </div>
            <div className="terminal-body text-sm">
              <span className="terminal-prompt">$</span>{" "}
              <span className="terminal-command">detect-vram</span>
              <br />
              <span className="terminal-output">→ ~{vram}GB VRAM found</span>
              <br />
              <span className="terminal-output">
                → Tier: {vramRec.tierName} <span className="text-terminal-green">✓</span>
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {imageModels.map((model) => {
            const canRunDirect = !vram || model.vramRequiredGB <= vram;
            const canRunQuantized = !!(model.quantizedOption && vram && model.quantizedOption.vramRequiredGB <= vram);
            const canRun = canRunDirect || canRunQuantized;
            const needsQuantization = !canRunDirect && canRunQuantized;
            const toolSupports = model.toolSupport.includes(selectedTool || "");
            const isRecommended = vramRec?.recommendedModels.includes(model.id);

            return (
              <div
                key={model.id}
                className={`p-4 rounded-lg border ${
                  !canRun || !toolSupports
                    ? "border-border opacity-40"
                    : isRecommended
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{model.name}</span>
                      {vramRec && (
                        <span className={`tag text-xs ${tierColorClass[vramRec.tier]}`}>
                          {tierEmoji[vramRec.tier]} {needsQuantization ? model.quantizedOption?.vramRequired : model.vramRequired}
                        </span>
                      )}
                      {isRecommended && canRun && toolSupports && (
                        <Badge variant="primary">Recommended</Badge>
                      )}
                      {!toolSupports && <Badge variant="default">Not supported by {tool?.name}</Badge>}
                      {!canRun && toolSupports && (
                        <Badge variant="default">Needs {model.vramRequired}+ VRAM</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted mb-1">{model.simpleDescription}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted">
                      <span>Quality: {model.quality}</span>
                      <span>•</span>
                      <span>Speed: {model.speed}</span>
                    </div>
                    {needsQuantization && model.quantizedOption && (
                      <p className="text-xs text-amber-600 mt-1">{model.quantizedOption.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-background-alt rounded-lg p-4">
          <h4 className="font-medium mb-2">Where to download models</h4>
          <p className="text-sm text-muted mb-2">
            <strong>SDXL models:</strong>{" "}
            <a href="https://civitai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Civitai.com
            </a>
          </p>
          <p className="text-sm text-muted mb-2">
            <strong>FLUX / Qwen Image:</strong>{" "}
            <a href="https://huggingface.co/black-forest-labs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Hugging Face
            </a>
          </p>
          {vram && vram <= 10 && (
            <p className="text-xs text-amber-600 mt-2">
              Tip: look for &quot;GGUF&quot; or &quot;Q8&quot; quantized versions to fit your {vram}GB GPU.
            </p>
          )}
        </div>
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StepComplete({ selectedTool }: { selectedTool: string | null }) {
  const tool = getImageToolById(selectedTool || "");

  const examplePrompts = [
    {
      prompt:
        "A cozy coffee shop on a rainy day, warm lighting, plants in the window, watercolor painting style",
      tip: "Describe the scene, lighting, and artistic style",
    },
    {
      prompt:
        "A golden retriever puppy playing in autumn leaves, soft sunlight, shallow depth of field, professional photography",
      tip: "Be specific about the subject and photographic style",
    },
    {
      prompt:
        "Futuristic city skyline at sunset, neon lights, flying cars, cyberpunk aesthetic, highly detailed",
      tip: "Include mood words and genre references",
    },
  ];

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

        <h2 className="font-serif text-2xl mb-2">You&apos;re Ready to Create!</h2>
        <p className="text-muted max-w-md mx-auto">
          {tool?.name} is set up and ready. Your images are created on your computer -
          nothing is uploaded anywhere.
        </p>
      </Card>

      <Card className="border-2 border-primary">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-pale flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Create Your First Image</h3>
        </div>

        <div className="space-y-4">
          <p className="text-muted">
            In {tool?.name}, you&apos;ll see a text box. This is where you describe what you want to see.
          </p>

          <div className="bg-background-alt rounded-lg p-4">
            <p className="font-medium mb-3">Try one of these prompts:</p>
            {examplePrompts.map((example, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="font-mono text-sm bg-foreground text-background rounded-lg p-3 mb-2">
                  {example.prompt}
                </div>
                <p className="text-xs text-muted">{example.tip}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-3">Tips for better images:</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Be specific:</strong> &quot;golden retriever puppy&quot; works better than just &quot;dog&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Mention the style:</strong> &quot;oil painting&quot;, &quot;photograph&quot;, &quot;anime&quot;, &quot;watercolor&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Add details:</strong> lighting, colors, mood, camera angle</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Use negative prompts:</strong> tell it what you DON&apos;T want, like &quot;blurry, low quality, distorted&quot;</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">What the settings mean</h3>
        <p className="text-sm text-muted mb-4">
          You might see some settings in {tool?.name}. Here&apos;s what they do in plain language:
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-background-alt rounded-lg">
            <span className="font-medium min-w-[120px]">Steps</span>
            <span className="text-muted">
              How many times the AI refines the image. More steps = better quality but slower. 20-30 is usually good.
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background-alt rounded-lg">
            <span className="font-medium min-w-[120px]">CFG Scale</span>
            <span className="text-muted">
              How closely to follow your description. Higher = more literal, lower = more creative. 7-8 is a good start.
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background-alt rounded-lg">
            <span className="font-medium min-w-[120px]">Seed</span>
            <span className="text-muted">
              A random number that determines the exact output. Reuse a seed to recreate an image, or leave random for variety.
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/images">
          <Button variant="secondary">Back to Images Overview</Button>
        </Link>
      </div>
    </div>
  );
}
