export interface ImageModel {
  id: string;
  name: string;
  description: string;
  simpleDescription: string;
  vramRequired: string;
  vramRequiredGB: number;
  speed: "fast" | "medium" | "slow";
  quality: "good" | "great" | "excellent";
  bestFor: string[];
  toolSupport: string[]; // Which tools support this model
  quantizedOption?: {
    vramRequired: string;
    vramRequiredGB: number;
    notes: string;
  };
  featured?: boolean;
  recommended?: boolean;
}

export const imageModels: ImageModel[] = [
  // Low VRAM options (4-6GB)
  {
    id: "sd-1.5",
    name: "Stable Diffusion 1.5",
    description:
      "The original Stable Diffusion model. Runs on almost any GPU with over 10,000 fine-tuned models available.",
    simpleDescription:
      "The classic - fast, works on almost any GPU, huge model library",
    vramRequired: "4GB",
    vramRequiredGB: 4,
    speed: "fast",
    quality: "good",
    bestFor: ["Older/budget GPUs", "Quick generations", "Huge variety of styles"],
    toolSupport: ["fooocus", "comfyui", "forge", "automatic1111", "invokeai"],
    featured: true,
  },
  {
    id: "sdxl-lightning",
    name: "SDXL Lightning",
    description:
      "A speed-optimized version of SDXL that generates images in just 4 steps. Great balance of quality and speed.",
    simpleDescription:
      "Fast version of SDXL - good quality in seconds",
    vramRequired: "6GB",
    vramRequiredGB: 6,
    speed: "fast",
    quality: "great",
    bestFor: ["Fast iterations", "Testing ideas quickly", "6-8GB GPUs"],
    toolSupport: ["comfyui", "forge", "automatic1111"],
    featured: true,
    recommended: true, // Good middle ground
  },
  // Standard VRAM options (8-12GB)
  {
    id: "sdxl",
    name: "SDXL",
    description:
      "The most popular model for high-quality images. Native 1024x1024 resolution with excellent detail.",
    simpleDescription:
      "The popular choice - great quality, tons of fine-tuned versions",
    vramRequired: "8GB",
    vramRequiredGB: 8,
    speed: "medium",
    quality: "great",
    bestFor: ["High quality images", "1024x1024 resolution", "Most use cases"],
    toolSupport: ["fooocus", "comfyui", "forge", "automatic1111", "invokeai"],
    featured: true,
  },
  {
    id: "sd-3.5-medium",
    name: "Stable Diffusion 3.5 Medium",
    description:
      "Latest SD model with excellent text rendering. Finally generates readable text in images!",
    simpleDescription:
      "Newest SD - great quality AND can write text correctly",
    vramRequired: "10GB",
    vramRequiredGB: 10,
    speed: "medium",
    quality: "excellent",
    bestFor: ["Images with text", "Modern quality", "Professional work"],
    toolSupport: ["comfyui", "forge"],
    featured: true,
  },
  {
    id: "flux-schnell",
    name: "FLUX.1 Schnell",
    description:
      "Fast, high-quality model from Black Forest Labs. Excellent prompt following with 4-step generation.",
    simpleDescription:
      "Fast AND high quality - great prompt understanding",
    vramRequired: "12GB",
    vramRequiredGB: 12,
    speed: "fast",
    quality: "excellent",
    bestFor: ["Best prompt following", "Fast high-quality", "Professional use"],
    toolSupport: ["comfyui", "forge"],
    quantizedOption: {
      vramRequired: "8GB",
      vramRequiredGB: 8,
      notes: "GGUF-Q8 version runs on 8GB with near-identical quality",
    },
    featured: true,
  },
  // High VRAM options (12GB+)
  {
    id: "flux-dev",
    name: "FLUX.1 Dev",
    description:
      "The highest quality FLUX model. Takes longer but produces stunning, detailed results.",
    simpleDescription:
      "Best quality FLUX - for when you need perfect results",
    vramRequired: "12GB",
    vramRequiredGB: 12,
    speed: "slow",
    quality: "excellent",
    bestFor: ["Maximum quality", "Final renders", "Professional work"],
    toolSupport: ["comfyui", "forge"],
    quantizedOption: {
      vramRequired: "8GB",
      vramRequiredGB: 8,
      notes: "GGUF-Q8 version runs on 8GB GPUs",
    },
    featured: true,
  },
  {
    id: "flux2-klein",
    name: "FLUX.2 Klein 4B",
    description:
      "Newest FLUX model optimized for speed. Sub-second generation on modern GPUs with editing capabilities.",
    simpleDescription:
      "Latest FLUX - incredibly fast, supports image editing",
    vramRequired: "13GB",
    vramRequiredGB: 13,
    speed: "fast",
    quality: "excellent",
    bestFor: ["Fast professional work", "Image editing", "Latest technology"],
    toolSupport: ["comfyui"],
    quantizedOption: {
      vramRequired: "8GB",
      vramRequiredGB: 8,
      notes: "Q5 quantized version fits 8GB GPUs",
    },
    featured: true,
  },
  {
    id: "qwen-image",
    name: "Qwen Image",
    description:
      "Alibaba's image model, notably strong at rendering legible text inside images - a historical weak point for FLUX and Stable Diffusion. Apache 2.0 licensed.",
    simpleDescription:
      "Great at putting readable text/logos in images - better than most at this",
    vramRequired: "16GB",
    vramRequiredGB: 16,
    speed: "medium",
    quality: "excellent",
    bestFor: ["Text in images", "Posters/signage", "Logos and typography"],
    toolSupport: ["comfyui"],
    quantizedOption: {
      vramRequired: "10GB",
      vramRequiredGB: 10,
      notes: "GGUF-Q8 version runs on 10GB GPUs",
    },
    featured: true,
  },
  // Power tier (24GB+)
  {
    id: "flux2-klein-9b",
    name: "FLUX.2 Klein 9B",
    description:
      "The larger Klein variant. Same speed-focused architecture as the 4B version with noticeably better detail and prompt adherence.",
    simpleDescription:
      "Bigger, sharper version of FLUX.2 Klein - needs a beefy GPU",
    vramRequired: "29GB",
    vramRequiredGB: 29,
    speed: "fast",
    quality: "excellent",
    bestFor: ["Maximum FLUX.2 quality", "Professional work", "24GB+ GPUs"],
    toolSupport: ["comfyui"],
    featured: true,
  },
];

// Recommendations based on VRAM
export interface VramRecommendation {
  vramRange: string;
  vramMin: number;
  vramMax: number;
  tier: "basic" | "standard" | "high" | "power";
  tierName: string;
  description: string;
  recommendedModels: string[];
  limitations: string[];
}

export const vramRecommendations: VramRecommendation[] = [
  {
    vramRange: "4-6GB",
    vramMin: 4,
    vramMax: 6,
    tier: "basic",
    tierName: "Basic",
    description: "You can create images, but stick to older/optimized models",
    recommendedModels: ["sd-1.5", "sdxl-lightning"],
    limitations: [
      "Limited to 512x512 for SD 1.5",
      "Newer models won't work well",
      "Slower generation times",
    ],
  },
  {
    vramRange: "8-10GB",
    vramMin: 8,
    vramMax: 10,
    tier: "standard",
    tierName: "Standard",
    description: "Great for most image creation - good quality at reasonable speed",
    recommendedModels: ["sdxl", "sdxl-lightning", "flux-schnell", "flux-dev"],
    limitations: [
      "FLUX models need quantized versions",
      "May need to reduce image size for some models",
    ],
  },
  {
    vramRange: "12-16GB",
    vramMin: 12,
    vramMax: 16,
    tier: "high",
    tierName: "High",
    description: "Run most models at full quality with good speed",
    recommendedModels: ["flux-schnell", "flux-dev", "sd-3.5-medium", "qwen-image", "sdxl"],
    limitations: [
      "FLUX.2 Dev 32B still needs quantization",
    ],
  },
  {
    vramRange: "24GB+",
    vramMin: 24,
    vramMax: 999,
    tier: "power",
    tierName: "Power",
    description: "Run any model at full quality - no compromises",
    recommendedModels: ["flux2-klein", "flux2-klein-9b", "flux-dev", "flux-schnell", "qwen-image"],
    limitations: [],
  },
];

export const getRecommendationForVram = (vramGB: number): VramRecommendation => {
  // Find the appropriate tier
  for (const rec of vramRecommendations) {
    if (vramGB >= rec.vramMin && vramGB <= rec.vramMax) {
      return rec;
    }
  }
  // Default to basic if below 4GB
  return vramRecommendations[0];
};

export const getModelsForVram = (vramGB: number): ImageModel[] => {
  return imageModels.filter((m) => {
    // Check if base model fits
    if (m.vramRequiredGB <= vramGB) return true;
    // Check if quantized version fits
    if (m.quantizedOption && m.quantizedOption.vramRequiredGB <= vramGB) return true;
    return false;
  });
};

export const getFeaturedImageModels = () =>
  imageModels.filter((m) => m.featured);

export const getImageModelById = (id: string) =>
  imageModels.find((m) => m.id === id);

// User-friendly explanations for image generation concepts
export const imageTerms = {
  vram: {
    term: "Graphics memory (VRAM)",
    explanation:
      "The memory on your graphics card. More VRAM = larger, higher quality images and faster models.",
  },
  prompt: {
    term: "Your description",
    explanation:
      "The text you type to describe what you want. Be specific about style, colors, and details.",
  },
  negativePrompt: {
    term: "Things to avoid",
    explanation:
      "Describe what you DON'T want in your image, like 'blurry, low quality'.",
  },
  steps: {
    term: "Refinement passes",
    explanation:
      "How many times the AI improves the image. More steps = better quality but slower. 20-30 is usually good.",
  },
  cfg: {
    term: "Creativity level",
    explanation:
      "How closely to follow your description. Higher = more literal, lower = more creative. 7-8 is a good starting point.",
  },
  checkpoint: {
    term: "AI model",
    explanation:
      "The trained AI that creates images. Different models have different styles and capabilities.",
  },
  lora: {
    term: "Style add-on",
    explanation:
      "Small files that add specific styles or characters to any model.",
  },
  quantized: {
    term: "Compressed model",
    explanation:
      "A smaller version of a model that uses less VRAM with minimal quality loss. Great for smaller GPUs.",
  },
  gguf: {
    term: "GGUF format",
    explanation:
      "A compression format that lets you run large models on smaller GPUs. Usually 8-bit (Q8) or 5-bit (Q5).",
  },
};
