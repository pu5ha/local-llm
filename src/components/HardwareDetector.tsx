"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Cpu,
  HardDrive,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import useHardwareDetection from "@/hooks/useHardwareDetection";

const osNames = {
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
  unknown: "Unknown OS",
};

export default function HardwareDetector() {
  const { hardware, recommendations } = useHardwareDetection();

  if (hardware.isLoading) {
    return (
      <div className="paper-card p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted">Detecting your hardware...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="paper-card p-8"
    >
      <h3 className="font-serif text-xl mb-6">Your System</h3>

      {/* Hardware Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-background-alt rounded-lg p-4">
          <Monitor className="w-5 h-5 text-primary mb-2" />
          <div className="text-xs text-muted mb-1">Operating System</div>
          <div className="font-medium">
            {osNames[hardware.os]}
            {hardware.osVersion && (
              <span className="text-muted ml-1">{hardware.osVersion}</span>
            )}
          </div>
        </div>

        <div className="bg-background-alt rounded-lg p-4">
          <HardDrive className="w-5 h-5 text-primary mb-2" />
          <div className="text-xs text-muted mb-1">Memory (RAM)</div>
          <div className="font-medium">
            {hardware.ram ? `${hardware.ram}GB+` : "Unknown"}
          </div>
        </div>

        <div className="bg-background-alt rounded-lg p-4">
          <Cpu className="w-5 h-5 text-primary mb-2" />
          <div className="text-xs text-muted mb-1">CPU Cores</div>
          <div className="font-medium">
            {hardware.cores ? `${hardware.cores} cores` : "Unknown"}
          </div>
        </div>

        <div className="bg-background-alt rounded-lg p-4">
          <Cpu className="w-5 h-5 text-primary mb-2" />
          <div className="text-xs text-muted mb-1">GPU</div>
          <div className="font-medium text-sm truncate" title={hardware.gpu || ""}>
            {hardware.gpu
              ? hardware.gpu.length > 20
                ? hardware.gpu.substring(0, 20) + "..."
                : hardware.gpu
              : "Unknown"}
          </div>
        </div>
      </div>

      {/* What You Can Run */}
      <div className="border-t border-border pt-6">
        <h4 className="font-medium mb-4">What You Can Run</h4>

        <div className="space-y-3">
          <ModelTier
            name="Small Models (3-4B)"
            examples="Llama 3.2 3B, Phi-3 Mini"
            canRun={recommendations.canRun4GB}
            ramRequired="4GB RAM"
          />
          <ModelTier
            name="Medium Models (7-8B)"
            examples="Mistral 7B, Llama 3.2 8B"
            canRun={recommendations.canRun8GB}
            ramRequired="8GB RAM"
          />
          <ModelTier
            name="Large Models (13B+)"
            examples="Code Llama 13B, Llama 2 13B"
            canRun={recommendations.canRun16GB}
            ramRequired="16GB RAM"
          />
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.recommendedModels.length > 0 && (
        <div className="border-t border-border pt-6 mt-6">
          <h4 className="font-medium mb-4">Recommended For You</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.recommendedModels.map((model) => (
              <span key={model} className="tag tag-green">
                {model}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted mt-3">
            Based on your hardware, you can run models up to{" "}
            <strong>{recommendations.maxModelSize}</strong> parameters
            comfortably.
          </p>
        </div>
      )}

      {/* Note about detection */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted">
          Note: Hardware detection via browser has limitations. Actual RAM may
          be higher than detected. GPU detection works best in Chrome/Edge.
        </p>
      </div>
    </motion.div>
  );
}

function ModelTier({
  name,
  examples,
  canRun,
  ramRequired,
}: {
  name: string;
  examples: string;
  canRun: boolean;
  ramRequired: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg ${
        canRun ? "bg-primary-pale" : "bg-background-alt opacity-60"
      }`}
    >
      {canRun ? (
        <Check className="w-5 h-5 text-primary flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-muted flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted truncate">{examples}</div>
      </div>
      <span className={`tag ${canRun ? "tag-green" : ""}`}>{ramRequired}</span>
    </div>
  );
}
