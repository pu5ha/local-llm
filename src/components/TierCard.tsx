"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Tier } from "@/data/tiers";

interface TierCardProps {
  tier: Tier;
  isUserTier?: boolean;
  showUpgrade?: boolean;
  delay?: number;
}

export default function TierCard({
  tier,
  isUserTier = false,
  showUpgrade = false,
  delay = 0,
}: TierCardProps) {
  const colorClasses = {
    green: {
      bg: "bg-primary-pale",
      border: "border-primary",
      text: "text-primary",
      tag: "tag-green",
    },
    amber: {
      bg: "bg-secondary-pale",
      border: "border-secondary",
      text: "text-secondary",
      tag: "tag-amber",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-600",
      tag: "bg-blue-100 text-blue-700",
    },
  };

  const colors = colorClasses[tier.color as keyof typeof colorClasses] || colorClasses.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`paper-card p-6 ${isUserTier ? `ring-2 ${colors.border}` : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{tier.emoji}</span>
        <div>
          <h3 className="font-serif text-xl">{tier.name} Tier</h3>
          <p className="text-sm text-muted">{tier.tagline}</p>
        </div>
        {isUserTier && (
          <span className={`ml-auto tag ${colors.tag}`}>Your computer</span>
        )}
      </div>

      {/* Description */}
      <p className="text-muted mb-4">{tier.description}</p>

      {/* Example Computers */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Example computers:</h4>
        <div className="flex flex-wrap gap-2">
          {tier.exampleComputers.slice(0, 3).map((computer) => (
            <span key={computer} className="text-xs bg-background-alt px-2 py-1 rounded">
              {computer}
            </span>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">What you can do:</h4>
        <ul className="space-y-1">
          {tier.capabilities.slice(0, 4).map((cap) => (
            <li key={cap} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      {tier.limitations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Limitations:</h4>
          <ul className="space-y-1">
            {tier.limitations.slice(0, 2).map((lim) => (
              <li key={lim} className="flex items-start gap-2 text-sm text-muted">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upgrade Info */}
      {showUpgrade && tier.upgradeInfo && (
        <div className={`mt-4 pt-4 border-t border-border ${colors.bg} -mx-6 -mb-6 px-6 pb-6 rounded-b-lg`}>
          <h4 className="text-sm font-medium mb-2">Want more?</h4>
          <p className="text-sm text-muted">
            <strong>{tier.upgradeInfo.action}</strong> (~{tier.upgradeInfo.cost}) to{" "}
            {tier.upgradeInfo.benefit.toLowerCase()}
          </p>
        </div>
      )}

      {/* CTA */}
      {isUserTier && (
        <Link
          href="/setup"
          className="btn-primary w-full mt-4 justify-center"
        >
          Get Started with {tier.name} Tier
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}
