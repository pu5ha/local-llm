"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Monitor, Zap } from "lucide-react";
import { getAllUseCases } from "@/data/useCases";

export default function UseCaseSelector() {
  const useCases = getAllUseCases();

  // User-friendly computer requirement labels
  const getRequirementLabel = (minimumTier: string) => {
    if (minimumTier === "entry") {
      return { text: "Works on most computers", color: "text-primary", bg: "bg-primary-pale" };
    }
    return { text: "Needs a newer computer", color: "text-amber-700", bg: "bg-amber-50" };
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {useCases.map((useCase, i) => {
        const requirement = getRequirementLabel(useCase.minimumTier);

        return (
          <motion.div
            key={useCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={`/computers?use=${useCase.id}`}
              className="block paper-card p-6 h-full group hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{useCase.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg mb-1 group-hover:text-primary transition-colors">
                    {useCase.name}
                  </h3>
                  <p className="text-sm text-muted mb-2">
                    {useCase.shortDescription}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${requirement.bg} ${requirement.color}`}>
                    {useCase.minimumTier === "entry" ? (
                      <Monitor className="w-3 h-3" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    {requirement.text}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
