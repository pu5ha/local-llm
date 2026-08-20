export interface ImageTool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  simpleDescription: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  interface: string;
  platforms: ("windows" | "mac" | "linux")[];
  features: string[];
  pros: string[];
  cons: string[];
  website: string;
  downloadUrl: {
    windows?: string;
    mac?: string;
    linux?: string;
    universal?: string;
  };
  modelIncluded: boolean;
  supportsFlux: boolean;
  supportsSD3: boolean;
  vramEfficiency: "standard" | "optimized" | "best";
  recommended?: boolean;
  recommendedFor?: string[];
}

export const imageTools: ImageTool[] = [
  // Mac-native apps (best for Apple Silicon)
  {
    id: "draw-things",
    name: "Draw Things",
    tagline: "Best for Mac - widest model support, in-app downloads",
    description:
      "A polished Mac app that runs AI models locally with its own Metal-accelerated engine. Supports SDXL, SD 3.5, and FLUX with automatic quantization, and downloads models directly in the app - no manual file wrangling.",
    simpleDescription:
      "Mac App Store app - easy model switching, supports the newest models",
    difficulty: "beginner",
    interface: "Native Mac app (polished UI)",
    platforms: ["mac"],
    features: [
      "Metal-accelerated native engine",
      "In-app model downloads with automatic quantization",
      "Supports SDXL, SD 3.5, and FLUX.1/2",
      "ControlNet and LoRA support",
      "Clean, intuitive interface",
    ],
    pros: [
      "Widest model support of any Mac app (SDXL, SD 3.5, FLUX)",
      "Download and quantize models inside the app - no manual setup",
      "Well optimized for M-series chips",
      "Regular updates with new model support",
    ],
    cons: [
      "Mac only",
      "Newest/experimental models can lag a few weeks behind release",
    ],
    website: "https://drawthings.ai",
    downloadUrl: {
      mac: "https://apps.apple.com/app/draw-things-ai-generation/id6444050820",
    },
    modelIncluded: false,
    supportsFlux: true,
    supportsSD3: true,
    vramEfficiency: "best",
    recommended: true,
    recommendedFor: ["mac-users", "apple-silicon"],
  },
  {
    id: "mochi-diffusion",
    name: "Mochi Diffusion",
    tagline: "Pure Core ML app for Apple Silicon",
    description:
      "A native macOS app that uses Apple's Core ML format to run models on Apple Silicon. A good option if you specifically want a Core ML-only, non-App-Store app, though model installs are manual and model support is narrower than Draw Things.",
    simpleDescription:
      "Native Core ML app - lightweight, but models must be installed manually",
    difficulty: "beginner",
    interface: "Native Mac app (simple and clean)",
    platforms: ["mac"],
    features: [
      "Native Core ML acceleration",
      "Uses Neural Engine for speed",
      "Low memory usage",
      "Text-to-image and image-to-image",
      "ControlNet support",
      "No Python setup required",
    ],
    pros: [
      "Efficient memory usage on Apple Silicon",
      "Native macOS experience",
      "Fully free and open-source, no App Store account needed",
    ],
    cons: [
      "Mac only",
      "Models must be downloaded and installed manually (no in-app browser)",
      "No official FLUX or SD 3.5 support - limited to SD 1.5/SDXL-era Core ML models",
    ],
    website: "https://github.com/MochiDiffusion/MochiDiffusion",
    downloadUrl: {
      mac: "https://github.com/MochiDiffusion/MochiDiffusion/releases",
    },
    modelIncluded: false,
    supportsFlux: false,
    supportsSD3: false,
    vramEfficiency: "best",
    recommendedFor: ["mac-users", "apple-silicon"],
  },
  {
    id: "diffusionbee",
    name: "DiffusionBee",
    tagline: "Simplest Mac app - just download and go",
    description:
      "A standalone Stable Diffusion app for macOS. The easiest way to get started - no Python, no setup, just install and generate.",
    simpleDescription:
      "One-click Mac installer - absolute easiest way to start",
    difficulty: "beginner",
    interface: "Native Mac app (minimal)",
    platforms: ["mac"],
    features: [
      "One-click installer",
      "No dependencies needed",
      "Text-to-image generation",
      "Inpainting and outpainting",
      "Offline generation",
    ],
    pros: [
      "Absolute easiest setup",
      "No Python or Terminal needed",
      "Works offline",
      "Good for complete beginners",
    ],
    cons: [
      "Mac only",
      "Limited features",
      "Fewer updates than alternatives",
      "Older model support",
    ],
    website: "https://diffusionbee.com",
    downloadUrl: {
      mac: "https://diffusionbee.com",
    },
    modelIncluded: true,
    supportsFlux: false,
    supportsSD3: false,
    vramEfficiency: "optimized",
    recommendedFor: ["mac-users", "absolute-beginners"],
  },
  // Cross-platform tools
  {
    id: "fooocus",
    name: "Fooocus",
    tagline: "The easiest way to create AI images",
    description:
      "Fooocus is the simplest option for creating AI images. Just type what you want, click generate, and you're done. No complex settings to configure. Designed with Midjourney's simplicity in mind.",
    simpleDescription:
      "Just type and generate - the simplest way to start (Midjourney-like experience)",
    difficulty: "beginner",
    interface: "Desktop app with simple text box",
    platforms: ["windows", "mac", "linux"],
    features: [
      "One-click installation",
      "SDXL model comes pre-installed",
      "Midjourney-style simple interface",
      "Style presets included",
      "Works offline",
      "Generate images in 5 minutes from install",
    ],
    pros: [
      "Absolute easiest to get started",
      "No model download needed",
      "Clean, simple interface",
      "Great default settings",
      "Perfect for complete beginners",
    ],
    cons: [
      "No FLUX model support",
      "No SD3 support",
      "Limited advanced features",
      "In maintenance mode (bug fixes only)",
    ],
    website: "https://github.com/lllyasviel/Fooocus",
    downloadUrl: {
      windows: "https://github.com/lllyasviel/Fooocus/releases",
      mac: "https://github.com/lllyasviel/Fooocus/releases",
      linux: "https://github.com/lllyasviel/Fooocus/releases",
    },
    modelIncluded: true,
    supportsFlux: false,
    supportsSD3: false,
    vramEfficiency: "standard",
    recommended: true,
    recommendedFor: ["absolute-beginners"],
  },
  {
    id: "forge",
    name: "SD WebUI Forge",
    tagline: "Fast and efficient - best for limited VRAM",
    description:
      "A fork of Automatic1111 with major performance improvements. 30-75% faster than A1111 with better VRAM management. Supports all the latest models including FLUX and SD3.",
    simpleDescription:
      "Faster, more efficient A1111 - great for 8GB GPUs, supports FLUX",
    difficulty: "beginner",
    interface: "Web browser (familiar A1111 layout)",
    platforms: ["windows", "mac", "linux"],
    features: [
      "30-75% faster than Automatic1111",
      "Optimized VRAM management",
      "Supports FLUX, SD3, SDXL",
      "Same interface as A1111",
      "Pre-configured extensions",
      "Better low-VRAM performance",
    ],
    pros: [
      "Best for 8GB VRAM GPUs",
      "Supports latest models (FLUX, SD3)",
      "Familiar interface if you know A1111",
      "Fastest for limited hardware",
      "Great extension support",
    ],
    cons: [
      "Need to download models separately",
      "More complex than Fooocus",
      "Some extensions need manual setup",
    ],
    website: "https://github.com/lllyasviel/stable-diffusion-webui-forge",
    downloadUrl: {
      universal: "https://github.com/lllyasviel/stable-diffusion-webui-forge/releases",
    },
    modelIncluded: false,
    supportsFlux: true,
    supportsSD3: true,
    vramEfficiency: "best",
    recommended: true,
    recommendedFor: ["limited-vram", "flux-users"],
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    tagline: "Most powerful - node-based workflows",
    description:
      "ComfyUI uses a visual workflow system where you connect boxes (nodes) to control exactly how images are created. Most powerful and fastest, but has a learning curve.",
    simpleDescription:
      "Connect boxes to build workflows - most powerful, steeper learning curve",
    difficulty: "intermediate",
    interface: "Node editor (visual programming)",
    platforms: ["windows", "mac", "linux"],
    features: [
      "Visual workflow editor",
      "Maximum control over generation",
      "Best performance/speed",
      "Share and import workflows",
      "Supports ALL models (FLUX, SD3, SDXL, etc.)",
      "Best VRAM management (dynamic loading)",
      "Huge community workflow library",
    ],
    pros: [
      "Most flexible and powerful",
      "Fastest generation speeds",
      "Best VRAM efficiency",
      "Community workflows available",
      "First to support new models",
    ],
    cons: [
      "10-20 hour learning curve",
      "Interface can be overwhelming",
      "Need to download models separately",
      "Node system takes getting used to",
    ],
    website: "https://github.com/comfyanonymous/ComfyUI",
    downloadUrl: {
      universal: "https://github.com/comfyanonymous/ComfyUI/releases",
    },
    modelIncluded: false,
    supportsFlux: true,
    supportsSD3: true,
    vramEfficiency: "best",
    recommendedFor: ["power-users", "flux-users"],
  },
  {
    id: "invokeai",
    name: "Invoke AI",
    tagline: "Professional creative AI studio",
    description:
      "A polished web interface designed for artists and creators. Clean design with canvas editing tools, gallery management, and professional workflow features.",
    simpleDescription:
      "Beautiful, professional interface designed for artists",
    difficulty: "beginner",
    interface: "Web browser (artist-focused design)",
    platforms: ["windows", "mac", "linux"],
    features: [
      "Beautiful web interface",
      "Canvas editing tools",
      "Gallery management",
      "Inpainting and outpainting",
      "Professional workflow",
      "Unified canvas for editing",
    ],
    pros: [
      "Most polished interface",
      "Great for digital artists",
      "Built-in editing tools",
      "Professional features",
      "Good documentation",
    ],
    cons: [
      "Larger installation",
      "Slower to add new model support",
      "More resource intensive",
      "Limited FLUX support",
    ],
    website: "https://invoke.ai",
    downloadUrl: {
      universal: "https://github.com/invoke-ai/InvokeAI/releases",
    },
    modelIncluded: false,
    supportsFlux: false,
    supportsSD3: false,
    vramEfficiency: "standard",
    recommendedFor: ["artists"],
  },
  {
    id: "automatic1111",
    name: "Automatic1111",
    tagline: "The original - most extensions available",
    description:
      "The most widely-used Stable Diffusion interface with the largest extension ecosystem. Great documentation and community, but SD Forge is now recommended for better performance.",
    simpleDescription:
      "The classic choice - huge extension library, but Forge is faster",
    difficulty: "intermediate",
    interface: "Web browser (feature-rich)",
    platforms: ["windows", "mac", "linux"],
    features: [
      "Largest extension library",
      "Most documentation/tutorials",
      "Huge community",
      "Very customizable",
      "Works with most models",
    ],
    pros: [
      "Most extensions available",
      "Huge community support",
      "Lots of tutorials",
      "Well documented",
    ],
    cons: [
      "Slower than Forge/ComfyUI",
      "Higher VRAM usage",
      "Limited FLUX support",
      "Consider Forge instead",
    ],
    website: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    downloadUrl: {
      universal: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    },
    modelIncluded: false,
    supportsFlux: false,
    supportsSD3: false,
    vramEfficiency: "standard",
  },
  {
    id: "swarmui",
    name: "SwarmUI",
    tagline: "Modern interface with video support",
    description:
      "A modular interface supporting SDXL, FLUX, and even video generation models. Simple installation with organized multi-tab workflows.",
    simpleDescription:
      "Modern tool with image AND video generation support",
    difficulty: "intermediate",
    interface: "Web browser (modern tabbed design)",
    platforms: ["windows", "mac", "linux"],
    features: [
      "Supports FLUX and SDXL",
      "Video generation support (LTX-V, Hunyuan)",
      "Multi-tab workflows",
      "Simple installation script",
      "Batch generation",
      "Docker support",
    ],
    pros: [
      "Video generation support",
      "Modern interface",
      "Good for batching",
      "Easy installation",
    ],
    cons: [
      "Smaller community",
      "Less documentation",
      "Fewer extensions",
    ],
    website: "https://github.com/Stability-AI/StableSwarmUI",
    downloadUrl: {
      universal: "https://github.com/Stability-AI/StableSwarmUI/releases",
    },
    modelIncluded: false,
    supportsFlux: true,
    supportsSD3: true,
    vramEfficiency: "optimized",
    recommendedFor: ["video-generation"],
  },
];

// Get tool recommendation based on user's situation
export interface ToolRecommendation {
  toolId: string;
  reason: string;
  priority: number;
}

export function getToolRecommendations(
  vramGB: number | null,
  wantsFlux: boolean = false,
  isAbsoluteBeginner: boolean = true,
  isAppleSilicon: boolean = false,
  platform: "mac" | "windows" | "linux" | "unknown" = "unknown"
): ToolRecommendation[] {
  const recommendations: ToolRecommendation[] = [];

  // Mac-specific recommendations (native Mac apps beat Python-based tools here)
  if (isAppleSilicon || platform === "mac") {
    if (isAbsoluteBeginner) {
      recommendations.push({
        toolId: "draw-things",
        reason: "Best Mac app - supports SDXL, SD 3.5, and FLUX with easy in-app downloads",
        priority: 1,
      });
      recommendations.push({
        toolId: "mochi-diffusion",
        reason: "Lightweight Core ML alternative, if you prefer a non-App-Store app",
        priority: 2,
      });
      recommendations.push({
        toolId: "diffusionbee",
        reason: "Absolute simplest - just install and go",
        priority: 3,
      });
    } else {
      // More advanced Mac user
      recommendations.push({
        toolId: "draw-things",
        reason: "Best balance of model support and Mac optimization",
        priority: 1,
      });
      recommendations.push({
        toolId: "mochi-diffusion",
        reason: "Pure Core ML alternative, but narrower model support",
        priority: 2,
      });
      if (wantsFlux) {
        recommendations.push({
          toolId: "comfyui",
          reason: "Node-based FLUX workflows (but slower on Mac than native apps)",
          priority: 3,
        });
      }
    }
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  // Windows/Linux recommendations
  // Absolute beginner - Fooocus
  if (isAbsoluteBeginner && !wantsFlux) {
    recommendations.push({
      toolId: "fooocus",
      reason: "Easiest to get started - just download and run",
      priority: 1,
    });
  }

  // Limited VRAM (4-10GB) - Forge is best
  if (vramGB && vramGB <= 10) {
    recommendations.push({
      toolId: "forge",
      reason: `Best performance for ${vramGB}GB VRAM - 30-75% faster`,
      priority: vramGB <= 8 ? 1 : 2,
    });
  }

  // Wants FLUX or latest models
  if (wantsFlux) {
    recommendations.push({
      toolId: "comfyui",
      reason: "Best FLUX support with community workflows",
      priority: 2,
    });
    recommendations.push({
      toolId: "forge",
      reason: "FLUX support with familiar A1111 interface",
      priority: 3,
    });
  }

  // Power user
  if (!isAbsoluteBeginner) {
    recommendations.push({
      toolId: "comfyui",
      reason: "Most powerful and flexible - worth learning",
      priority: 2,
    });
  }

  // Sort by priority
  return recommendations.sort((a, b) => a.priority - b.priority);
}

// Get tools available for a specific platform
export const getToolsForPlatform = (platform: "mac" | "windows" | "linux") =>
  imageTools.filter((t) => t.platforms.includes(platform));

// Get Mac-native tools (Core ML optimized)
export const getMacNativeTools = () =>
  imageTools.filter((t) =>
    t.platforms.length === 1 &&
    t.platforms[0] === "mac" &&
    t.vramEfficiency === "best"
  );

export const getRecommendedImageTool = () =>
  imageTools.find((t) => t.recommended);

export const getImageToolsByDifficulty = (
  difficulty: ImageTool["difficulty"]
) => imageTools.filter((t) => t.difficulty === difficulty);

export const getImageToolById = (id: string) =>
  imageTools.find((t) => t.id === id);

export const getBeginnerImageTools = () =>
  imageTools.filter((t) => t.difficulty === "beginner");

export const getToolsWithFluxSupport = () =>
  imageTools.filter((t) => t.supportsFlux);
