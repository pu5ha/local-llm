"use client";

import { useState, useEffect } from "react";
import {
  lookupVramGB,
  getAppleSiliconSuggestion,
  DISCRETE_GPU_RAM_HINTS,
} from "@/lib/catalog/hardwareTables";
import { getRamCapabilityFlags } from "@/lib/catalog/recommend";

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

export type ModelRecommendation = ReturnType<typeof getRamCapabilityFlags>;

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

  // Estimate VRAM: data-driven lookup for discrete GPUs (see hardwareTables.ts
  // for the full, easily-extended table); Apple Silicon uses unified memory
  // shared with system RAM instead of dedicated VRAM.
  if (gpuType === "apple" && ram) {
    // Apple Silicon shares RAM with GPU - typically ~75% is usable for GPU tasks
    estimatedVram = Math.floor(ram * 0.75);
  } else {
    estimatedVram = lookupVramGB(gpuLower);
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

  const isAppleSilicon = /\bm\d\b/.test(gpuLower) || gpuLower.includes("apple");

  if (isAppleSilicon && os === "mac") {
    const { suggestedRamGB, label } = getAppleSiliconSuggestion(gpuLower, cores);
    return { suggestedRam: suggestedRamGB, reason: label, isAppleSilicon: true };
  }

  // For non-Apple Silicon Macs (Intel)
  if (os === "mac" && cores && cores >= 8) {
    return {
      suggestedRam: 16,
      reason: "Mac with 8+ CPU cores",
      isAppleSilicon: false,
    };
  }

  // Discrete GPU hints (see hardwareTables.ts to extend)
  const gpuHint = DISCRETE_GPU_RAM_HINTS.find((h) => h.match.test(gpuLower));
  if (gpuHint) {
    return { suggestedRam: gpuHint.suggestedRamGB, reason: gpuHint.reason, isAppleSilicon: false };
  }

  // Windows/Linux with many cores
  if ((os === "windows" || os === "linux") && cores && cores >= 8) {
    return {
      suggestedRam: 16,
      reason: "8+ CPU cores detected",
      isAppleSilicon: false,
    };
  }

  return { suggestedRam: null, reason: null, isAppleSilicon: false };
}

/**
 * Generic RAM-capability flags only - which specific model to recommend for
 * this hardware is decided by getRecommendedModel() in
 * @/lib/catalog/recommend.ts, the single source of truth for that decision.
 */
export function getRecommendations(hardware: HardwareInfo): ModelRecommendation {
  // Use suggested RAM (from heuristics) if available, then browser-detected RAM, then default to 8GB
  const ram = hardware.suggestedRam || hardware.ram || 8;
  const gpu = hardware.gpu?.toLowerCase() || "";

  const hasNvidiaGPU =
    gpu.includes("nvidia") || gpu.includes("geforce") || gpu.includes("rtx");
  const hasAppleSilicon =
    gpu.includes("apple") || (hardware.os === "mac" && gpu.includes("m1"));

  // Boost effective RAM if good GPU detected
  const effectiveRam = hasNvidiaGPU || hasAppleSilicon ? ram * 1.5 : ram;

  return getRamCapabilityFlags(effectiveRam);
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
      recommendedModels: ["FLUX.2 Klein 9B", "FLUX.2 Klein", "Qwen Image", "FLUX.1 Dev", "FLUX.1 Schnell"],
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
      recommendedModels: ["FLUX.1 Schnell", "FLUX.1 Dev", "Qwen Image", "SD 3.5 Medium", "SDXL"],
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
