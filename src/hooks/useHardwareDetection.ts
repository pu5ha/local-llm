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

function estimateRAM(): number | null {
  if (typeof window === "undefined") return null;

  // navigator.deviceMemory is available in Chrome/Edge
  // Returns approximate RAM in GB (rounds to power of 2)
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory) {
    return nav.deviceMemory;
  }

  return null;
}

function getCores(): number | null {
  if (typeof window === "undefined") return null;
  return navigator.hardwareConcurrency || null;
}

export function getRecommendations(hardware: HardwareInfo): ModelRecommendation {
  const ram = hardware.ram || 8; // Default assumption
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
      "Llama 3.2 8B",
      "Mistral 7B",
      "DeepSeek Coder 6.7B",
      "Code Llama 13B",
    ];
    maxModelSize = "13B";
  } else if (canRun8GB) {
    recommendedModels = [
      "Llama 3.2 8B",
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
  });

  useEffect(() => {
    const detect = () => {
      try {
        const { os, osVersion } = detectOS();
        const gpu = detectGPU();
        const ram = estimateRAM();
        const cores = getCores();

        setHardware({
          os,
          osVersion,
          ram,
          gpu,
          cores,
          isLoading: false,
          error: null,
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

  return { hardware, recommendations };
}
