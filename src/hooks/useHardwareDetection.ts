"use client";

import { useState, useEffect } from "react";

export interface HardwareInfo {
  os: "windows" | "mac" | "linux" | "unknown";
  osVersion: string;
  ram: number | null;
  gpu: string | null;
  cores: number | null;
  isLoading: boolean;
  error: string | null;
  ramDetectionMethod: "api" | "manual" | "unknown";
  isRamSuspicious: boolean; // True when detected RAM < 4GB (likely inaccurate)
  // Smart RAM suggestion based on hardware heuristics
  suggestedRam: number | null;
  suggestedRamReason: string | null;
  isAppleSilicon: boolean;
  // GPU/VRAM info for image generation
  gpuType: "nvidia" | "amd" | "apple" | "intel" | "unknown";
  estimatedVram: number | null;
  canRunImageGeneration: boolean;
  imageGenerationTier: "basic" | "standard" | "high" | "power" | "none";
}

export interface ModelRecommendation {
  canRun4GB: boolean;
  canRun8GB: boolean;
  canRun16GB: boolean;
  recommendedModels: string[];
  maxModelSize: string;
}

function detectOS(): { os: HardwareInfo["os"]; osVersion: string } {
  if (typeof window === "undefined") {
    return { os: "unknown", osVersion: "" };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || "";

  if (userAgent.includes("win")) {
    const match = userAgent.match(/windows nt ([\d.]+)/);
    const version = match ? match[1] : "";
    const versionMap: Record<string, string> = {
      "10.0": "10/11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
    };
    return { os: "windows", osVersion: versionMap[version] || version };
  }

  if (userAgent.includes("mac") || platform.includes("mac")) {
    const match = userAgent.match(/mac os x ([\d_]+)/);
    const version = match ? match[1].replace(/_/g, ".") : "";
    return { os: "mac", osVersion: version };
  }

  if (userAgent.includes("linux")) {
    return { os: "linux", osVersion: "" };
  }

  return { os: "unknown", osVersion: "" };
}

function detectGPU(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) return null;

    const debugInfo = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_debug_renderer_info"
    );
    if (!debugInfo) return null;

    const renderer = (gl as WebGLRenderingContext).getParameter(
      debugInfo.UNMASKED_RENDERER_WEBGL
    );

    return renderer || null;
  } catch {
    return null;
  }
}

interface RAMDetectionResult {
  ram: number | null;
  method: "api" | "unknown";
  isSuspicious: boolean;
}

function estimateRAM(): RAMDetectionResult {
  if (typeof window === "undefined") {
    return { ram: null, method: "unknown", isSuspicious: false };
  }

  // navigator.deviceMemory is available in Chrome/Edge (not Safari/Firefox)
  // Returns approximate RAM in GB (rounds to power of 2: 0.25, 0.5, 1, 2, 4, 8)
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory) {
    const ram = nav.deviceMemory;
    // Flag as suspicious if detected RAM is less than 4GB
    // Most computers have 8-16GB, so very low values likely indicate API limitations
    const isSuspicious = ram < 4;
    return { ram, method: "api", isSuspicious };
  }

  return { ram: null, method: "unknown", isSuspicious: false };
}

function getCores(): number | null {
  if (typeof window === "undefined") return null;
  return navigator.hardwareConcurrency || null;
}

interface RAMSuggestion {
  suggestedRam: number | null;
  reason: string | null;
  isAppleSilicon: boolean;
}

interface GPUInfo {
  gpuType: "nvidia" | "amd" | "apple" | "intel" | "unknown";
  estimatedVram: number | null;
  canRunImageGeneration: boolean;
  imageGenerationTier: "basic" | "standard" | "high" | "power" | "none";
}

/**
 * Estimate VRAM from GPU string using heuristics.
 * This is approximate since browsers can't directly detect VRAM.
 */
function estimateGPUInfo(gpu: string | null, isAppleSilicon: boolean, ram: number | null): GPUInfo {
  if (!gpu) {
    return {
      gpuType: "unknown",
      estimatedVram: null,
      canRunImageGeneration: false,
      imageGenerationTier: "none",
    };
  }

  const gpuLower = gpu.toLowerCase();
  let gpuType: GPUInfo["gpuType"] = "unknown";
  let estimatedVram: number | null = null;

  // Detect GPU type
  if (gpuLower.includes("nvidia") || gpuLower.includes("geforce") || gpuLower.includes("rtx") || gpuLower.includes("gtx") || gpuLower.includes("quadro")) {
    gpuType = "nvidia";
  } else if (gpuLower.includes("radeon") || gpuLower.includes("amd") || gpuLower.includes("rx ")) {
    gpuType = "amd";
  } else if (gpuLower.includes("apple") || gpuLower.includes("m1") || gpuLower.includes("m2") || gpuLower.includes("m3") || gpuLower.includes("m4")) {
    gpuType = "apple";
  } else if (gpuLower.includes("intel") || gpuLower.includes("iris") || gpuLower.includes("uhd")) {
    gpuType = "intel";
  }

  // Estimate VRAM based on GPU model
  // NVIDIA RTX 40 series
  if (gpuLower.includes("rtx 4090")) estimatedVram = 24;
  else if (gpuLower.includes("rtx 4080")) estimatedVram = 16;
  else if (gpuLower.includes("rtx 4070 ti")) estimatedVram = 12;
  else if (gpuLower.includes("rtx 4070")) estimatedVram = 12;
  else if (gpuLower.includes("rtx 4060 ti")) estimatedVram = 8;
  else if (gpuLower.includes("rtx 4060")) estimatedVram = 8;
  // NVIDIA RTX 30 series
  else if (gpuLower.includes("rtx 3090")) estimatedVram = 24;
  else if (gpuLower.includes("rtx 3080 ti")) estimatedVram = 12;
  else if (gpuLower.includes("rtx 3080")) estimatedVram = 10;
  else if (gpuLower.includes("rtx 3070 ti")) estimatedVram = 8;
  else if (gpuLower.includes("rtx 3070")) estimatedVram = 8;
  else if (gpuLower.includes("rtx 3060 ti")) estimatedVram = 8;
  else if (gpuLower.includes("rtx 3060")) estimatedVram = 12;
  else if (gpuLower.includes("rtx 3050")) estimatedVram = 8;
  // NVIDIA RTX 20 series
  else if (gpuLower.includes("rtx 2080 ti")) estimatedVram = 11;
  else if (gpuLower.includes("rtx 2080")) estimatedVram = 8;
  else if (gpuLower.includes("rtx 2070")) estimatedVram = 8;
  else if (gpuLower.includes("rtx 2060")) estimatedVram = 6;
  // NVIDIA GTX 16 series
  else if (gpuLower.includes("gtx 1660")) estimatedVram = 6;
  else if (gpuLower.includes("gtx 1650")) estimatedVram = 4;
  // NVIDIA GTX 10 series
  else if (gpuLower.includes("gtx 1080 ti")) estimatedVram = 11;
  else if (gpuLower.includes("gtx 1080")) estimatedVram = 8;
  else if (gpuLower.includes("gtx 1070")) estimatedVram = 8;
  else if (gpuLower.includes("gtx 1060")) estimatedVram = 6;
  else if (gpuLower.includes("gtx 1050")) estimatedVram = 4;
  // AMD cards
  else if (gpuLower.includes("rx 7900")) estimatedVram = 20;
  else if (gpuLower.includes("rx 7800")) estimatedVram = 16;
  else if (gpuLower.includes("rx 7700")) estimatedVram = 12;
  else if (gpuLower.includes("rx 7600")) estimatedVram = 8;
  else if (gpuLower.includes("rx 6900")) estimatedVram = 16;
  else if (gpuLower.includes("rx 6800")) estimatedVram = 16;
  else if (gpuLower.includes("rx 6700")) estimatedVram = 12;
  else if (gpuLower.includes("rx 6600")) estimatedVram = 8;
  // Apple Silicon - uses unified memory (shared with RAM)
  else if (gpuType === "apple" && ram) {
    // Apple Silicon shares RAM with GPU
    // Typically can use about 75% of total RAM for GPU tasks
    estimatedVram = Math.floor(ram * 0.75);
  }

  // Determine image generation tier based on VRAM
  let imageGenerationTier: GPUInfo["imageGenerationTier"] = "none";
  let canRunImageGeneration = false;

  if (estimatedVram !== null) {
    if (estimatedVram >= 24) {
      imageGenerationTier = "power";
      canRunImageGeneration = true;
    } else if (estimatedVram >= 12) {
      imageGenerationTier = "high";
      canRunImageGeneration = true;
    } else if (estimatedVram >= 8) {
      imageGenerationTier = "standard";
      canRunImageGeneration = true;
    } else if (estimatedVram >= 4) {
      imageGenerationTier = "basic";
      canRunImageGeneration = true;
    }
  } else if (gpuType === "nvidia" || gpuType === "amd") {
    // If we detected a discrete GPU but couldn't estimate VRAM, assume at least basic capability
    imageGenerationTier = "basic";
    canRunImageGeneration = true;
    estimatedVram = 6; // Conservative estimate for unknown discrete GPU
  }

  return {
    gpuType,
    estimatedVram,
    canRunImageGeneration,
    imageGenerationTier,
  };
}

/**
 * Estimate likely RAM based on detectable hardware characteristics.
 * This uses heuristics since browser APIs can't reliably detect RAM.
 */
function estimateRamFromHeuristics(
  os: HardwareInfo["os"],
  gpu: string | null,
  cores: number | null
): RAMSuggestion {
  const gpuLower = gpu?.toLowerCase() || "";

  // Detect Apple Silicon
  const isAppleSilicon =
    gpuLower.includes("apple") ||
    gpuLower.includes("m1") ||
    gpuLower.includes("m2") ||
    gpuLower.includes("m3") ||
    gpuLower.includes("m4");

  if (isAppleSilicon && os === "mac") {
    // Apple Silicon RAM estimation based on core count
    // Core counts:
    // - M1/M2/M3 base: 8 cores
    // - M1/M2/M3 Pro: 10-12 cores
    // - M1/M2/M3 Max: 10-12 cores (same as Pro but more GPU)
    // - M4 base: 10 cores - minimum 16GB (no 8GB option!)
    // - M4 Pro: 12-14 cores - minimum 24GB
    // - M4 Max: 14-16 cores - minimum 36GB
    //
    // Key insight: M4 chips (2024+) start at 16GB minimum.
    // Most users buying Apple Silicon today get 16GB+.
    // 8GB is only on base M1/M2/M3 MacBook Air - increasingly rare.

    if (cores && cores >= 14) {
      // Likely M3/M4 Max - minimum 36GB, suggest 32 (common config)
      return {
        suggestedRam: 32,
        reason: "Apple Silicon Mac (high-performance chip)",
        isAppleSilicon: true
      };
    } else if (cores && cores >= 10) {
      // M4 base (10 cores), M3/M4 Pro (12 cores), or M1/M2/M3 Pro/Max
      // M4 minimum is 16GB, Pro models are 18GB+
      // Safe to suggest 16GB
      return {
        suggestedRam: 16,
        reason: "Apple Silicon Mac",
        isAppleSilicon: true
      };
    } else {
      // M1/M2/M3 base (8 cores) - could be 8GB or 16GB
      // But 16GB is much more common now, and better to suggest higher
      // User can correct down if needed
      return {
        suggestedRam: 16,
        reason: "Apple Silicon Mac",
        isAppleSilicon: true
      };
    }
  }

  // For non-Apple Silicon Macs (Intel)
  if (os === "mac" && cores) {
    if (cores >= 8) {
      return {
        suggestedRam: 16,
        reason: "Mac with 8+ CPU cores",
        isAppleSilicon: false
      };
    }
  }

  // Check for high-end GPUs that suggest a powerful system
  if (gpuLower.includes("rtx 40") || gpuLower.includes("rtx 30")) {
    return {
      suggestedRam: 32,
      reason: "High-end NVIDIA GPU detected",
      isAppleSilicon: false
    };
  }

  if (gpuLower.includes("rtx") || gpuLower.includes("gtx 10") || gpuLower.includes("gtx 16")) {
    return {
      suggestedRam: 16,
      reason: "NVIDIA gaming GPU detected",
      isAppleSilicon: false
    };
  }

  // Windows/Linux with many cores
  if ((os === "windows" || os === "linux") && cores && cores >= 8) {
    return {
      suggestedRam: 16,
      reason: "8+ CPU cores detected",
      isAppleSilicon: false
    };
  }

  return { suggestedRam: null, reason: null, isAppleSilicon: false };
}

export function getRecommendations(hardware: HardwareInfo): ModelRecommendation {
  // Use suggested RAM (from heuristics) if available, then browser-detected RAM, then default to 8GB
  const ram = hardware.suggestedRam || hardware.ram || 8;
  const gpu = hardware.gpu?.toLowerCase() || "";

  // Check for dedicated GPUs
  const hasNvidiaGPU =
    gpu.includes("nvidia") || gpu.includes("geforce") || gpu.includes("rtx");
  const hasAMDGPU = gpu.includes("radeon") || gpu.includes("amd");
  const hasAppleSilicon =
    gpu.includes("apple") || (hardware.os === "mac" && gpu.includes("m1"));

  // Boost effective RAM if good GPU detected
  const effectiveRam = hasNvidiaGPU || hasAppleSilicon ? ram * 1.5 : ram;

  const canRun4GB = effectiveRam >= 4;
  const canRun8GB = effectiveRam >= 8;
  const canRun16GB = effectiveRam >= 16;

  let recommendedModels: string[] = [];
  let maxModelSize = "3B";

  if (canRun16GB) {
    recommendedModels = [
      "Llama 3.1 8B",
      "Mistral 7B",
      "DeepSeek Coder 6.7B",
      "Code Llama 13B",
    ];
    maxModelSize = "13B";
  } else if (canRun8GB) {
    recommendedModels = [
      "Llama 3.1 8B",
      "Mistral 7B",
      "Phi-3 Mini",
      "DeepSeek Coder 6.7B",
    ];
    maxModelSize = "7-8B";
  } else if (canRun4GB) {
    recommendedModels = ["Llama 3.2 3B", "Phi-3 Mini"];
    maxModelSize = "3-4B";
  }

  return {
    canRun4GB,
    canRun8GB,
    canRun16GB,
    recommendedModels,
    maxModelSize,
  };
}

export default function useHardwareDetection() {
  const [hardware, setHardware] = useState<HardwareInfo>({
    os: "unknown",
    osVersion: "",
    ram: null,
    gpu: null,
    cores: null,
    isLoading: true,
    error: null,
    ramDetectionMethod: "unknown",
    isRamSuspicious: false,
    suggestedRam: null,
    suggestedRamReason: null,
    isAppleSilicon: false,
    gpuType: "unknown",
    estimatedVram: null,
    canRunImageGeneration: false,
    imageGenerationTier: "none",
  });

  useEffect(() => {
    const detect = () => {
      try {
        const { os, osVersion } = detectOS();
        const gpu = detectGPU();
        const ramResult = estimateRAM();
        const cores = getCores();

        // Get smart RAM suggestion based on hardware heuristics
        const ramSuggestion = estimateRamFromHeuristics(os, gpu, cores);

        // Use API result if available and not suspicious, otherwise use heuristic
        let finalRam = ramResult.ram;
        let finalMethod = ramResult.method;
        let isSuspicious = ramResult.isSuspicious;

        // If API returned suspicious value but we have a heuristic suggestion,
        // mark as suspicious so user sees the suggestion
        if (ramResult.ram && ramResult.ram < 4 && ramSuggestion.suggestedRam) {
          isSuspicious = true;
        }

        // Get GPU info for image generation
        const gpuInfo = estimateGPUInfo(
          gpu,
          ramSuggestion.isAppleSilicon,
          ramSuggestion.suggestedRam || finalRam
        );

        setHardware({
          os,
          osVersion,
          ram: finalRam,
          gpu,
          cores,
          isLoading: false,
          error: null,
          ramDetectionMethod: finalMethod,
          isRamSuspicious: isSuspicious,
          suggestedRam: ramSuggestion.suggestedRam,
          suggestedRamReason: ramSuggestion.reason,
          isAppleSilicon: ramSuggestion.isAppleSilicon,
          gpuType: gpuInfo.gpuType,
          estimatedVram: gpuInfo.estimatedVram,
          canRunImageGeneration: gpuInfo.canRunImageGeneration,
          imageGenerationTier: gpuInfo.imageGenerationTier,
        });
      } catch (err) {
        setHardware((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to detect hardware",
        }));
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(detect, 100);
    return () => clearTimeout(timer);
  }, []);

  const recommendations = getRecommendations(hardware);
  const imageRecommendations = getImageRecommendations(hardware);

  return { hardware, recommendations, imageRecommendations };
}

export interface ImageRecommendation {
  canRun: boolean;
  tier: "basic" | "standard" | "high" | "power" | "none";
  tierDescription: string;
  recommendedModels: string[];
  recommendedTool: string;
  limitations: string[];
}

export function getImageRecommendations(hardware: HardwareInfo): ImageRecommendation {
  const vram = hardware.estimatedVram;

  if (!vram) {
    return {
      canRun: false,
      tier: "none",
      tierDescription: "Unable to determine GPU capability",
      recommendedModels: [],
      recommendedTool: "fooocus",
      limitations: [
        "Could not detect a compatible GPU",
        "Image generation requires a dedicated graphics card",
      ],
    };
  }

  // 24GB+ - Power tier
  if (vram >= 24) {
    return {
      canRun: true,
      tier: "power",
      tierDescription: "Run any model at full quality - no compromises",
      recommendedModels: ["FLUX.2 Klein", "FLUX.1 Dev", "FLUX.1 Schnell", "SD 3.5"],
      recommendedTool: "comfyui",
      limitations: [],
    };
  }

  // 12-23GB - High tier
  if (vram >= 12) {
    return {
      canRun: true,
      tier: "high",
      tierDescription: "Run most models at full quality with good speed",
      recommendedModels: ["FLUX.1 Schnell", "FLUX.1 Dev", "SD 3.5 Medium", "SDXL"],
      recommendedTool: "forge",
      limitations: ["Largest models (FLUX.2 Dev 32B) need quantization"],
    };
  }

  // 8-11GB - Standard tier
  if (vram >= 8) {
    return {
      canRun: true,
      tier: "standard",
      tierDescription: "Great for most image creation - FLUX available with quantization",
      recommendedModels: ["SDXL", "SDXL Lightning", "FLUX.1 (quantized)"],
      recommendedTool: "forge",
      limitations: [
        "FLUX models need GGUF/Q8 quantized versions",
        "May need to reduce image size for some models",
      ],
    };
  }

  // 4-7GB - Basic tier
  if (vram >= 4) {
    return {
      canRun: true,
      tier: "basic",
      tierDescription: "You can create images with optimized models",
      recommendedModels: ["Stable Diffusion 1.5", "SDXL Lightning"],
      recommendedTool: "forge",
      limitations: [
        "Limited to SD 1.5 (512x512) for best results",
        "SDXL Lightning for occasional 1024x1024",
        "FLUX models won't work",
      ],
    };
  }

  // Below 4GB
  return {
    canRun: false,
    tier: "none",
    tierDescription: "GPU has insufficient memory for AI image generation",
    recommendedModels: [],
    recommendedTool: "fooocus",
    limitations: [
      "Minimum 4GB VRAM required",
      "Consider upgrading your graphics card",
    ],
  };
}
