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

interface HardwareDetectorProps {
  confirmedRam?: number | null;
}

export default function HardwareDetector({ confirmedRam }: HardwareDetectorProps = {}) {
  const { hardware, recommendations: baseRecommendations } = useHardwareDetection();

  // Use confirmed RAM if provided (user selected on computers page)
  const displayRam = confirmedRam || hardware.suggestedRam;
  const ramSource = confirmedRam ? "confirmed" : "estimated";

  // Recalculate recommendations based on confirmed RAM if provided
  const recommendations = confirmedRam
    ? {
        ...baseRecommendations,
        canRun4GB: confirmedRam >= 4,
        canRun8GB: confirmedRam >= 8,
        canRun16GB: confirmedRam >= 16,
      }
    : baseRecommendations;

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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

      {/* RAM - show confirmed value if provided, otherwise estimate */}
      <div className="bg-primary-pale rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-muted mb-1">Memory (RAM)</div>
            {displayRam ? (
              <>
                <div className="font-medium">{displayRam}GB</div>
                {ramSource === "confirmed" ? (
                  <p className="text-xs text-muted mt-1">
                    You confirmed this on the previous page.{" "}
                    <a href="/setup" className="text-primary underline">Change</a>
                  </p>
                ) : (
                  <p className="text-xs text-muted mt-1">
                    Estimated based on {hardware.suggestedRamReason?.toLowerCase()}.{" "}
                    <a href="/setup" className="text-primary underline">Verify your RAM</a>
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="font-medium">Unknown</div>
                <p className="text-xs text-muted mt-1">
                  <a href="/setup" className="text-primary underline">Check your RAM</a> to see accurate recommendations.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* What You Can Run */}
      <div className="border-t border-border pt-6">
        <h4 className="font-medium mb-2">What You Can Run</h4>
        <p className="text-sm text-muted mb-4">
          Bigger models are smarter but need more memory and respond slower.
        </p>

        <div className="space-y-3">
          <ModelTierCard
            name="Good"
            description="Quick answers, simple questions, basic help"
            examples="Like a helpful assistant for everyday tasks"
            canRun={recommendations.canRun4GB}
            ramRequired="4GB"
            speed="Fast responses"
          />
          <ModelTierCard
            name="Better"
            description="Writing help, coding assistance, deeper conversations"
            examples="Like ChatGPT for most tasks"
            canRun={recommendations.canRun8GB}
            ramRequired="8GB"
            speed="Moderate speed"
          />
          <ModelTierCard
            name="Best"
            description="Complex analysis, professional coding, detailed writing"
            examples="For power users who need the best quality"
            canRun={recommendations.canRun16GB}
            ramRequired="16GB"
            speed="Slower but smarter"
          />
        </div>
      </div>

      {/* Primary Recommendation */}
      {displayRam && (
        <div className="border-t border-border pt-6 mt-6">
          <h4 className="font-medium mb-3">Our Recommendation</h4>
          <div className="bg-primary-pale rounded-lg p-4">
            {displayRam >= 16 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Llama 3.1 8B</span>
                  <span className="tag tag-green">Best for {displayRam}GB RAM</span>
                </div>
                <p className="text-sm text-muted">
                  Smart and capable — handles most tasks like writing, coding help, and conversations.
                </p>
              </>
            ) : displayRam >= 8 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Llama 3.2 3B</span>
                  <span className="tag tag-green">Best for {displayRam}GB RAM</span>
                </div>
                <p className="text-sm text-muted">
                  Fast and lightweight — great for quick questions and simple tasks.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                We recommend at least 8GB RAM to run AI models locally.
              </p>
            )}
          </div>
          <p className="text-xs text-muted mt-3">
            You'll choose your model in the next step. This is just our suggestion based on your {displayRam}GB RAM.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function ModelTierCard({
  name,
  description,
  examples,
  canRun,
  ramRequired,
  speed,
}: {
  name: string;
  description: string;
  examples: string;
  canRun: boolean;
  ramRequired: string;
  speed: string;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        canRun
          ? "bg-primary-pale border-primary/20"
          : "bg-background-alt border-border opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {canRun ? (
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-muted flex-shrink-0" />
          )}
          <span className="font-semibold">{name}</span>
        </div>
        <div className="text-right">
          <span className={`tag text-xs ${canRun ? "tag-green" : ""}`}>
            {canRun ? `✓ You have ${ramRequired}+` : `Needs ${ramRequired}`}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium ml-7 mb-1">{description}</p>
      <p className="text-xs text-muted ml-7">{examples}</p>
      <p className="text-xs text-muted ml-7 mt-1">{speed}</p>
    </div>
  );
}
