"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Circle,
  Monitor,
  Download,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Cpu,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button, Card, Badge, CodeBlock } from "@/components/ui";
import useHardwareDetection from "@/hooks/useHardwareDetection";
import { imageTools, getImageToolById, getToolRecommendations } from "@/data/imageTools";
import { imageModels, getModelsForVram, getRecommendationForVram } from "@/data/imageModels";

type Step = "hardware" | "tool" | "install" | "model" | "generate";

const stepOrder: Step[] = ["hardware", "tool", "install", "model", "generate"];

const stepInfo = {
  hardware: { title: "Check Hardware", icon: Monitor },
  tool: { title: "Pick Tool", icon: Download },
  install: { title: "Install", icon: Cpu },
  model: { title: "Model", icon: ImageIcon },
  generate: { title: "Generate", icon: Sparkles },
};

function ImageSetupContent() {
  const [currentStep, setCurrentStep] = useState<Step>("hardware");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const { hardware, imageRecommendations } = useHardwareDetection();

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
            Image Generation <span className="gradient-text">Setup</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            We'll walk you through setting up AI image generation on your computer.
            In a few steps, you'll be creating images from text descriptions.
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
                      className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
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
              <StepHardware
                hardware={hardware}
                imageRecommendations={imageRecommendations}
                onNext={goNext}
              />
            )}
            {currentStep === "tool" && (
              <StepTool
                selectedTool={selectedTool}
                onSelect={setSelectedTool}
                onNext={goNext}
                onPrev={goPrev}
                vram={hardware.estimatedVram}
                isAppleSilicon={hardware.isAppleSilicon}
                platform={hardware.os}
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
                vram={hardware.estimatedVram}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {currentStep === "generate" && (
              <StepGenerate selectedTool={selectedTool} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface StepHardwareProps {
  hardware: ReturnType<typeof useHardwareDetection>["hardware"];
  imageRecommendations: ReturnType<typeof useHardwareDetection>["imageRecommendations"];
  onNext: () => void;
}

function StepHardware({ hardware, imageRecommendations, onNext }: StepHardwareProps) {
  const gpuTypeNames = {
    nvidia: "NVIDIA",
    amd: "AMD",
    apple: "Apple Silicon",
    intel: "Intel",
    unknown: "Unknown",
  };

  const isAppleSilicon = hardware.gpuType === "apple" || hardware.isAppleSilicon;

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Can your computer create AI images?</h3>
        {isAppleSilicon ? (
          <p className="text-muted mb-6">
            Great news — your Mac has Apple Silicon, which means the graphics processor (GPU)
            is built right into your chip. No separate graphics card needed! Your Mac's
            RAM is shared between the CPU and GPU.
          </p>
        ) : (
          <p className="text-muted mb-6">
            AI image generation uses your graphics processor (GPU) to create images.
            {hardware.gpuType === "nvidia" || hardware.gpuType === "amd"
              ? " You have a dedicated graphics card, which is perfect for this."
              : " Let's check what graphics hardware you have."}
          </p>
        )}

        {hardware.isLoading ? (
          <div className="bg-background-alt rounded-lg p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Detecting your hardware...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Detected Hardware */}
            <div className="bg-background-alt rounded-lg p-4 space-y-3">
              {isAppleSilicon ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Chip</span>
                    <span className="font-medium">Apple Silicon (M-series)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Total RAM (shared with GPU)</span>
                    <span className="font-medium">{hardware.suggestedRam || 16}GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Available for images (estimated)</span>
                    <span className="font-medium">{hardware.estimatedVram || Math.floor((hardware.suggestedRam || 16) * 0.75)}GB</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Graphics Card</span>
                    <span className="font-medium text-sm text-right max-w-[60%]">
                      {hardware.gpu || "Not detected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">GPU Type</span>
                    <span className="font-medium">{gpuTypeNames[hardware.gpuType]}</span>
                  </div>
                  {hardware.estimatedVram && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Graphics Memory (VRAM)</span>
                      <span className="font-medium">{hardware.estimatedVram}GB</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Result */}
            {imageRecommendations.canRun ? (
              <div className="bg-primary-pale rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">
                    Great news! Your computer can create AI images
                  </span>
                </div>
                <p className="text-sm text-muted mb-4">
                  {imageRecommendations.tierDescription}
                </p>

                {/* Capabilities */}
                <div className="space-y-2">
                  <ImageTierIndicator
                    name="Basic quality (512x512)"
                    description="Smaller images, faster generation"
                    canRun={hardware.estimatedVram ? hardware.estimatedVram >= 4 : false}
                  />
                  <ImageTierIndicator
                    name="Standard quality (1024x1024)"
                    description="Good quality, reasonable speed"
                    canRun={hardware.estimatedVram ? hardware.estimatedVram >= 8 : false}
                  />
                  <ImageTierIndicator
                    name="High quality (detailed images)"
                    description="Best results, takes longer"
                    canRun={hardware.estimatedVram ? hardware.estimatedVram >= 12 : false}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 mb-2">
                      We couldn't detect your graphics card
                    </p>
                    <p className="text-sm text-amber-700">
                      This might happen if you're using a browser that restricts hardware detection.
                      You can still continue — many computers can create AI images even if we can't detect the GPU here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-background-alt rounded-lg p-4 text-sm">
              {isAppleSilicon ? (
                <>
                  <p className="font-medium mb-2">How Apple Silicon handles image generation</p>
                  <p className="text-muted">
                    Unlike Windows PCs with separate graphics cards, your Mac's M-series chip has
                    a unified memory system. Your {hardware.suggestedRam || hardware.estimatedVram || 16}GB of RAM is shared
                    between your CPU and GPU. We estimate about 75% ({Math.floor((hardware.suggestedRam || hardware.estimatedVram || 16) * 0.75)}GB)
                    is available for image generation, which is plenty for high-quality images.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-2">What does "graphics memory" mean?</p>
                  <p className="text-muted">
                    Your graphics card has its own memory (called VRAM) separate from your computer's main memory (RAM).
                    This graphics memory determines how large and detailed your AI-generated images can be.
                    More graphics memory = better quality images.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ImageTierIndicator({
  name,
  description,
  canRun,
}: {
  name: string;
  description: string;
  canRun: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded ${canRun ? "" : "opacity-50"}`}>
      {canRun ? (
        <Check className="w-4 h-4 text-primary flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-muted flex-shrink-0" />
      )}
      <div>
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted ml-2">— {description}</span>
      </div>
    </div>
  );
}

interface StepToolProps {
  selectedTool: string | null;
  onSelect: (tool: string) => void;
  onNext: () => void;
  onPrev: () => void;
  vram: number | null;
  isAppleSilicon: boolean;
  platform: "mac" | "windows" | "linux" | "unknown";
}

function StepTool({ selectedTool, onSelect, onNext, onPrev, vram, isAppleSilicon, platform }: StepToolProps) {
  // Filter tools based on platform
  const isMac = isAppleSilicon || platform === "mac";

  const mainTools = isMac
    ? imageTools.filter((t) =>
        // Show Mac-native apps first, then cross-platform
        t.platforms.includes("mac") &&
        (t.difficulty === "beginner" || t.recommended || t.id === "comfyui")
      )
    : imageTools.filter((t) =>
        t.platforms.includes(platform === "unknown" ? "windows" : platform) &&
        (t.difficulty === "beginner" || t.recommended || t.id === "comfyui") &&
        !t.platforms.every(p => p === "mac") // Exclude Mac-only apps
      );

  // Sort: Mac-native apps first for Mac users
  const sortedTools = isMac
    ? [...mainTools].sort((a, b) => {
        const aIsMacNative = a.platforms.length === 1 && a.platforms[0] === "mac";
        const bIsMacNative = b.platforms.length === 1 && b.platforms[0] === "mac";
        if (aIsMacNative && !bIsMacNative) return -1;
        if (!aIsMacNative && bIsMacNative) return 1;
        return 0;
      })
    : mainTools;

  // Get personalized recommendations
  const recommendations = getToolRecommendations(vram, false, true, isAppleSilicon, platform);
  const topRecommendation = recommendations[0]?.toolId;

  // Determine what to recommend based on platform and VRAM
  const getRecommendationText = () => {
    if (isMac) {
      return (
        <>
          <strong>For your Mac:</strong> We recommend{" "}
          <span className="text-primary font-medium">Mochi Diffusion</span> or{" "}
          <span className="text-primary font-medium">Draw Things</span> — they're
          native Mac apps that use Core ML for much faster, more efficient generation
          than Python-based tools.
        </>
      );
    }
    if (!vram || vram >= 12) {
      return (
        <>
          <strong>Not sure?</strong> Choose{" "}
          <span className="text-primary font-medium">Fooocus</span> — it's the
          easiest way to start. Just download, run, and type what you want.
        </>
      );
    }
    if (vram <= 8) {
      return (
        <>
          <strong>With {vram}GB VRAM:</strong> We recommend{" "}
          <span className="text-primary font-medium">SD WebUI Forge</span> — it's
          optimized for your hardware and 30-75% faster than other options.
        </>
      );
    }
    return (
      <>
        <strong>With {vram}GB VRAM:</strong> Fooocus is easiest, but{" "}
        <span className="text-primary font-medium">Forge</span> gives you access
        to newer models like FLUX.
      </>
    );
  };

  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">How do you want to create images?</h3>
        <p className="text-muted mb-2">
          These tools let you type a description and get an image back.
          Pick the one that matches how you like to work:
        </p>
        <div className="bg-background-alt rounded-lg p-3 mb-6 text-sm">
          {getRecommendationText()}
        </div>

        <div className="space-y-4">
          {sortedTools.map((tool) => {
            const isMacNative = tool.platforms.length === 1 && tool.platforms[0] === "mac";
            const isTopPick = tool.id === topRecommendation ||
              (isMac && isMacNative && tool.id === "mochi-diffusion") ||
              (!isMac && vram && vram <= 8 && tool.id === "forge") ||
              (!isMac && !vram && tool.id === "fooocus");

            return (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedTool === tool.id
                    ? "border-primary bg-primary/5"
                    : isTopPick
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedTool === tool.id
                        ? "bg-primary text-white"
                        : "bg-card-hover"
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{tool.name}</span>
                      {isTopPick && (
                        <Badge variant="primary">
                          {isMac && isMacNative
                            ? "Best for your Mac"
                            : vram && vram <= 8
                            ? "Best for your GPU"
                            : "Recommended"}
                        </Badge>
                      )}
                      {isMacNative && (
                        <Badge variant="default">Native Mac app</Badge>
                      )}
                      {tool.modelIncluded && (
                        <Badge variant="default">Model included</Badge>
                      )}
                      {tool.supportsFlux && !isMacNative && (
                        <Badge variant="default">FLUX support</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted mb-2">{tool.simpleDescription}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-background-alt px-2 py-1 rounded">
                        {tool.interface}
                      </span>
                      {tool.vramEfficiency === "best" && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Best for low VRAM
                        </span>
                      )}
                    </div>
                    {tool.id === "fooocus" && !isMac && (
                      <p className="text-xs text-amber-600 mt-2">
                        Note: Fooocus doesn't support FLUX or SD3 models
                      </p>
                    )}
                    {isMacNative && (
                      <p className="text-xs text-green-600 mt-2">
                        No Python or Terminal setup needed - just download and run
                      </p>
                    )}
                    {!isMacNative && isMac && (
                      <p className="text-xs text-amber-600 mt-2">
                        Requires Python setup - slower than native Mac apps
                      </p>
                    )}
                  </div>
                  {selectedTool === tool.id && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={() => {}}
            className="text-sm text-muted hover:text-foreground"
          >
            View all tools including advanced options
          </button>
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

interface StepInstallProps {
  selectedTool: string | null;
  os: string;
  onNext: () => void;
  onPrev: () => void;
}

function StepInstall({ selectedTool, os, onNext, onPrev }: StepInstallProps) {
  const [installed, setInstalled] = useState(false);
  const tool = getImageToolById(selectedTool || "");

  const getInstallInstructions = () => {
    // Mac-native apps (simple installs)
    if (selectedTool === "mochi-diffusion") {
      return {
        title: "Install Mochi Diffusion",
        steps: [
          {
            text: "Download Mochi Diffusion",
            detail: "Click the download button below. On the page that opens, scroll down to 'Assets' and click the file ending in .dmg (for example: 'MochiDiffusion-4.x.x.dmg').",
          },
          {
            text: "Install the app",
            detail: "Find the downloaded .dmg file in your Downloads folder (or click it in Safari's downloads). When the window opens, drag the Mochi Diffusion icon onto the Applications folder icon.",
          },
          {
            text: "Open Mochi Diffusion",
            detail: "Go to your Applications folder (Finder → Go → Applications) and double-click Mochi Diffusion. If you see a warning saying it's from an 'unidentified developer', right-click the app, choose 'Open', then click 'Open' again.",
          },
        ],
        downloadUrl: "https://github.com/MochiDiffusion/MochiDiffusion/releases",
        postInstallNote: "mochi-model-download",
      };
    }

    if (selectedTool === "draw-things") {
      return {
        title: "Install Draw Things",
        steps: [
          {
            text: "Open the Mac App Store link",
            detail: "Click the button below. It will open the App Store app on your Mac and take you directly to Draw Things.",
          },
          {
            text: "Click 'Get' to install",
            detail: "In the App Store, click the blue 'Get' button, then 'Install'. You may need to sign in with your Apple ID.",
          },
          {
            text: "Open Draw Things",
            detail: "Once installed, click 'Open' in the App Store, or find Draw Things in your Applications folder (Finder → Go → Applications).",
          },
        ],
        downloadUrl: "https://apps.apple.com/app/draw-things-ai-generation/id6444050820",
        postInstallNote: "draw-things-model-download",
      };
    }

    if (selectedTool === "diffusionbee") {
      return {
        title: "Install DiffusionBee",
        steps: [
          {
            text: "Download DiffusionBee",
            detail: "Click the button below. On the website, click the big 'Download' button for Mac. The file is about 2GB.",
          },
          {
            text: "Install the app",
            detail: "Find the downloaded .dmg file in your Downloads folder and double-click it. When the window opens, drag the DiffusionBee icon onto the Applications folder.",
          },
          {
            text: "Open DiffusionBee",
            detail: "Go to Applications (Finder → Go → Applications) and double-click DiffusionBee. If you see a security warning, right-click the app, choose 'Open', then click 'Open' again.",
          },
          {
            text: "Wait for setup to complete",
            detail: "The first time you open DiffusionBee, it will download and set up the AI model. This happens automatically — just wait for it to finish (a few minutes).",
          },
          {
            text: "Start creating!",
            detail: "Once setup is done, you'll see a text box. Type what you want to see and click Generate. That's it!",
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
              detail: "Click the button below to go to the download page. Look for 'Fooocus_win64_xxx.7z' (the latest version).",
            },
            {
              text: "Extract the downloaded file",
              detail: "Right-click the .7z file and choose 'Extract All' (you may need 7-Zip). Extract it somewhere easy to find, like your Desktop.",
            },
            {
              text: "Open the Fooocus folder",
              detail: "Double-click the extracted folder to open it.",
            },
            {
              text: "Run Fooocus",
              detail: "Double-click 'run.bat' to start Fooocus. A command window will open and start downloading the AI model (this takes a few minutes the first time).",
            },
            {
              text: "Wait for your browser to open",
              detail: "Fooocus will automatically open in your web browser when it's ready. You'll see a text box where you can type your image descriptions.",
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
              command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
            },
            {
              text: "Install Python and Git",
              detail: "In Terminal, run:",
              command: "brew install python git",
            },
            {
              text: "Download Fooocus",
              detail: "In Terminal, run:",
              command: "git clone https://github.com/lllyasviel/Fooocus.git",
            },
            {
              text: "Go into the Fooocus folder",
              detail: "In Terminal, run:",
              command: "cd Fooocus",
            },
            {
              text: "Install and run Fooocus",
              detail: "In Terminal, run:",
              command: "python3 -m pip install -r requirements_versions.txt && python3 entry_with_update.py",
            },
            {
              text: "Wait for your browser to open",
              detail: "Fooocus will download the AI model and open in your browser when ready.",
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
              text: "Download Fooocus",
              detail: "In Terminal, run:",
              command: "git clone https://github.com/lllyasviel/Fooocus.git && cd Fooocus",
            },
            {
              text: "Install and run Fooocus",
              detail: "In Terminal, run:",
              command: "pip3 install -r requirements_versions.txt && python3 entry_with_update.py",
            },
            {
              text: "Wait for your browser to open",
              detail: "Fooocus will download the AI model and open in your browser when ready.",
            },
          ],
          downloadUrl: null,
        };
      }
    }

    if (selectedTool === "invokeai") {
      return {
        title: `Install Invoke AI on ${os === "mac" ? "macOS" : os === "linux" ? "Linux" : "Windows"}`,
        steps: [
          { text: "Download the installer from the official website", detail: null },
          { text: "Run the installer and follow the prompts", detail: null },
          { text: "Open Invoke AI when installation completes", detail: null },
          { text: "Download a model from within the app", detail: null },
        ],
        downloadUrl: "https://github.com/invoke-ai/InvokeAI/releases",
      };
    }

    if (selectedTool === "comfyui") {
      return {
        title: `Install ComfyUI on ${os === "mac" ? "macOS" : os === "linux" ? "Linux" : "Windows"}`,
        steps: [
          { text: "Download ComfyUI from GitHub", detail: "Look for the portable version if you're on Windows" },
          { text: "Extract and run ComfyUI", detail: null },
          { text: "Download a model separately (see next step)", detail: null },
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
                {step.detail && (
                  <p className="text-sm text-muted mb-2">{step.detail}</p>
                )}
                {"command" in step && step.command && (
                  <CodeBlock code={step.command} />
                )}
              </div>
            </li>
          ))}
        </ol>

        {selectedTool === "fooocus" && (
          <div className="mt-6 bg-primary-pale rounded-lg p-4">
            <p className="text-sm">
              <strong>Good news!</strong> Fooocus comes with an AI model already included.
              The first time you run it, it will automatically download everything you need.
              This can take 5-10 minutes depending on your internet speed.
            </p>
          </div>
        )}

        {selectedTool === "diffusionbee" && (
          <div className="mt-6 bg-primary-pale rounded-lg p-4">
            <p className="text-sm">
              <strong>Good news!</strong> DiffusionBee includes a model already.
              You can start generating images as soon as you open the app!
            </p>
          </div>
        )}

        {/* Detailed model download instructions for Draw Things */}
        {selectedTool === "draw-things" && (
          <div className="mt-6 border-t border-border pt-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">4</span>
              Download a Model (inside the app)
            </h4>
            <p className="text-sm text-muted mb-4">
              Draw Things makes it easy — you download models right inside the app. Here's how:
            </p>

            <div className="bg-background-alt rounded-lg p-4 space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">Step 1: Open the model manager</p>
                <p className="text-sm text-muted">
                  In Draw Things, look at the right sidebar. Click on the <strong>model name</strong> (it might say "No Model" if you just installed).
                  A panel will open showing available models.
                </p>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Step 2: Pick a model to download</p>
                <p className="text-sm text-muted mb-2">
                  You'll see a list of models you can download. We recommend starting with one of these:
                </p>
                <ul className="text-sm space-y-2 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>DreamShaper</strong> — Great for artistic, creative images. Good starting point!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>Realistic Vision</strong> — Best for photorealistic images of people and scenes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>SDXL</strong> — Higher quality but needs more memory</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Step 3: Click download</p>
                <p className="text-sm text-muted">
                  Click on the model you want, then click the <strong>download button</strong> (cloud icon with arrow).
                  Wait for it to finish — this can take a few minutes depending on your internet speed.
                </p>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Step 4: Select the model</p>
                <p className="text-sm text-muted">
                  Once downloaded, click on the model to select it. The model name should now appear in the sidebar.
                  You're ready to generate!
                </p>
              </div>
            </div>

            <div className="mt-4 bg-primary-pale rounded-lg p-3">
              <p className="text-sm">
                <strong>Tip:</strong> Start with <strong>DreamShaper</strong> — it's versatile,
                works well on Macs with 16GB RAM, and produces great results for most prompts.
              </p>
            </div>
          </div>
        )}

        {/* Detailed model download instructions for Mochi Diffusion */}
        {selectedTool === "mochi-diffusion" && (
          <div className="mt-6 border-t border-border pt-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">4</span>
              Download a Model (Required)
            </h4>
            <p className="text-sm text-muted mb-4">
              Mochi Diffusion needs a special "Core ML" model to work. Here's exactly how to get one:
            </p>

            <div className="bg-background-alt rounded-lg p-4 space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">Step 1: Open the model download page</p>
                <p className="text-sm text-muted mb-2">
                  Click this link to open Hugging Face (a website where AI models are shared):
                </p>
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
                <p className="font-medium text-sm mb-2">Step 2: Download the model file</p>
                <p className="text-sm text-muted mb-2">
                  On that page, look for a file called <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-xs">split_einsum_v2_compiled.zip</code> and click on it.
                  Then click the <strong>"download"</strong> button. The file is about 2.5GB.
                </p>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Step 3: Unzip and move to the right folder</p>
                <p className="text-sm text-muted mb-2">
                  Double-click the downloaded .zip file to unzip it. You'll get a folder.
                  Now you need to move this folder to where Mochi Diffusion looks for models:
                </p>
                <ol className="text-sm text-muted list-decimal list-inside space-y-1 ml-2">
                  <li>Open <strong>Finder</strong></li>
                  <li>Press <strong>Cmd + Shift + G</strong> (or click Go → Go to Folder)</li>
                  <li>Paste this path: <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-xs">~/Documents/MochiDiffusion/models</code></li>
                  <li>Click <strong>Go</strong> (this creates the folder if it doesn't exist)</li>
                  <li>Drag your unzipped model folder here</li>
                </ol>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Step 4: Restart Mochi Diffusion</p>
                <p className="text-sm text-muted">
                  Close and reopen Mochi Diffusion. Your model should now appear in the model dropdown!
                </p>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> If the models folder doesn't exist, you can create it yourself:
                Open Finder → Documents → Create a folder called "MochiDiffusion" → Inside that, create a folder called "models"
              </p>
            </div>
          </div>
        )}

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
            <span>I have installed {tool?.name} and it's running</span>
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

interface StepModelProps {
  selectedTool: string | null;
  vram: number | null;
  onNext: () => void;
  onPrev: () => void;
}

function StepModel({ selectedTool, vram, onNext, onPrev }: StepModelProps) {
  const tool = getImageToolById(selectedTool || "");
  const vramRec = vram ? getRecommendationForVram(vram) : null;
  const availableModels = vram ? getModelsForVram(vram) : imageModels;

  // Mac-native apps with included models
  if (selectedTool === "diffusionbee") {
    return (
      <div>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Your AI Model</h3>

          <div className="bg-primary-pale rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">
                DiffusionBee includes a model already!
              </span>
            </div>
            <p className="text-sm text-muted">
              You can start generating images right away. DiffusionBee uses Stable Diffusion
              which works great for most image types.
            </p>
          </div>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Continue to Generate
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Mac-native apps that need model downloads
  if (selectedTool === "mochi-diffusion" || selectedTool === "draw-things") {
    const appName = selectedTool === "mochi-diffusion" ? "Mochi Diffusion" : "Draw Things";
    return (
      <div>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Download a Model</h3>

          <p className="text-muted mb-4">
            {appName} needs a model to generate images. These Mac apps use special
            "Core ML" versions of models that run faster on Apple Silicon.
          </p>

          {selectedTool === "mochi-diffusion" && (
            <div className="space-y-4">
              <div className="bg-background-alt rounded-lg p-4">
                <h4 className="font-medium mb-2">Where to get Core ML models:</h4>
                <p className="text-sm text-muted mb-3">
                  Visit the Hugging Face collection of Core ML models. Look for models
                  with "coreml" in the name.
                </p>
                <a
                  href="https://huggingface.co/coreml-community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Browse Core ML models on Hugging Face →
                </a>
              </div>

              <div className="bg-primary-pale rounded-lg p-4">
                <h4 className="font-medium mb-2">Recommended for your Mac:</h4>
                <ul className="text-sm space-y-2">
                  <li><strong>Stable Diffusion 2.1</strong> — Good balance of quality and speed</li>
                  <li><strong>Dreamshaper</strong> — Great for artistic images</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTool === "draw-things" && (
            <div className="space-y-4">
              <div className="bg-primary-pale rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">
                    Draw Things downloads models for you!
                  </span>
                </div>
                <p className="text-sm text-muted">
                  Go to <strong>Settings → Models</strong> in the app to browse and download models.
                  Popular options include:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• <strong>Dreamshaper</strong> — Artistic, creative styles</li>
                  <li>• <strong>Juggernaut</strong> — Realistic images</li>
                  <li>• <strong>Playground 2.5</strong> — High quality general purpose</li>
                </ul>
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
            Continue to Generate
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (selectedTool === "fooocus") {
    return (
      <div>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Your AI Model</h3>

          <div className="bg-primary-pale rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">
                Fooocus comes with SDXL already installed!
              </span>
            </div>
            <p className="text-sm text-muted">
              SDXL is a high-quality model that works great for most images.
              You're ready to start generating images right away.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="font-medium mb-3">Want different styles?</h4>
            <p className="text-sm text-muted mb-4">
              You can add more SDXL-based models later for different styles:
            </p>
            <div className="space-y-3">
              {[
                { name: "Juggernaut XL", description: "Realistic photos and people" },
                { name: "Animagine XL", description: "Anime and illustration style" },
                { name: "DreamShaper XL", description: "Artistic and creative styles" },
                { name: "RealVisXL V5", description: "Best photorealism" },
              ].map((model) => (
                <div key={model.name} className="bg-background-alt rounded-lg p-3 text-sm">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-muted ml-2">— {model.description}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-4">
              Download models from{" "}
              <a href="https://civitai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Civitai.com
              </a>
              . Note: Fooocus only supports SDXL models, not FLUX or SD3.
            </p>
          </div>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Continue to Generate
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // For Forge, ComfyUI, and other tools
  return (
    <div>
      <Card>
        <h3 className="text-lg font-semibold mb-2">Choose Your AI Model</h3>
        <p className="text-muted mb-4">
          Different models produce different quality and styles. We'll recommend
          the best options for your hardware.
        </p>

        {/* VRAM-based recommendation */}
        {vramRec && (
          <div className="bg-primary-pale rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                Your GPU: ~{vram}GB VRAM ({vramRec.tierName} Tier)
              </span>
            </div>
            <p className="text-sm text-muted mb-3">{vramRec.description}</p>
            <div className="text-sm">
              <strong>Best models for you:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {vramRec.recommendedModels.slice(0, 3).map((modelId) => {
                  const model = imageModels.find((m) => m.id === modelId);
                  return model ? (
                    <span key={modelId} className="bg-white/50 px-2 py-1 rounded text-xs">
                      {model.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            {vramRec.limitations.length > 0 && (
              <p className="text-xs text-muted mt-3">
                Note: {vramRec.limitations[0]}
              </p>
            )}
          </div>
        )}

        {/* Model list */}
        <div className="space-y-3">
          {imageModels.map((model) => {
            // Check if model can run (either directly or with quantization)
            const canRunDirect = !vram || model.vramRequiredGB <= vram;
            const canRunQuantized = model.quantizedOption && vram && model.quantizedOption.vramRequiredGB <= vram;
            const canRun = canRunDirect || canRunQuantized;
            const needsQuantization = !canRunDirect && canRunQuantized;

            // Check if tool supports this model
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
                      {needsQuantization ? (
                        <Badge variant="default">{model.quantizedOption?.vramRequired} (quantized)</Badge>
                      ) : (
                        <Badge variant="default">{model.vramRequired}</Badge>
                      )}
                      {isRecommended && canRun && toolSupports && (
                        <Badge variant="primary">Recommended</Badge>
                      )}
                      {!toolSupports && (
                        <Badge variant="default">Not supported by {tool?.name}</Badge>
                      )}
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
                      <p className="text-xs text-amber-600 mt-1">
                        {model.quantizedOption.notes}
                      </p>
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
            <strong>FLUX models:</strong>{" "}
            <a href="https://huggingface.co/black-forest-labs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              HuggingFace (Black Forest Labs)
            </a>
          </p>
          <p className="text-sm text-muted">
            <strong>SD3 models:</strong>{" "}
            <a href="https://huggingface.co/stabilityai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              HuggingFace (Stability AI)
            </a>
          </p>
          {vram && vram <= 10 && (
            <p className="text-xs text-amber-600 mt-3">
              Tip: Look for "GGUF" or "Q8" quantized versions of FLUX models to run them on your {vram}GB GPU.
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

interface StepGenerateProps {
  selectedTool: string | null;
}

function StepGenerate({ selectedTool }: StepGenerateProps) {
  const tool = getImageToolById(selectedTool || "");

  const examplePrompts = [
    {
      prompt: "A cozy coffee shop on a rainy day, warm lighting, plants in the window, watercolor painting style",
      tip: "Describe the scene, lighting, and artistic style",
    },
    {
      prompt: "A golden retriever puppy playing in autumn leaves, soft sunlight, shallow depth of field, professional photography",
      tip: "Be specific about the subject and photographic style",
    },
    {
      prompt: "Futuristic city skyline at sunset, neon lights, flying cars, cyberpunk aesthetic, highly detailed",
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

        <h2 className="text-2xl font-bold mb-2">You're Ready to Create!</h2>
        <p className="text-muted max-w-md mx-auto">
          {tool?.name} is set up and ready. Your images are created on your computer —
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
            In {tool?.name}, you'll see a text box. This is where you describe what you want to see.
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
                <span>
                  <strong>Be specific:</strong> "golden retriever puppy" works better than just "dog"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Mention the style:</strong> "oil painting", "photograph", "anime", "watercolor"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Add details:</strong> lighting, colors, mood, camera angle
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Use negative prompts:</strong> Tell it what you DON'T want, like "blurry, low quality, distorted"
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">What the settings mean</h3>
        <p className="text-sm text-muted mb-4">
          You might see some settings in {tool?.name}. Here's what they do in plain language:
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
              How closely to follow your description. Higher = more literal, lower = more creative. 7-8 is a good starting point.
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background-alt rounded-lg">
            <span className="font-medium min-w-[120px]">Seed</span>
            <span className="text-muted">
              A random number that determines the exact output. Use the same seed to recreate an image, or leave random for variety.
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

export default function ImageSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ImageSetupContent />
    </Suspense>
  );
}
