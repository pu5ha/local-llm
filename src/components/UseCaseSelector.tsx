"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllUseCases } from "@/data/useCases";
import { getTierById } from "@/data/tiers";

export default function UseCaseSelector() {
  const useCases = getAllUseCases();

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {useCases.map((useCase, i) => {
        const minTier = getTierById(useCase.minimumTier);

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
                  <p className="text-sm text-muted mb-3">
                    {useCase.shortDescription}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`tag ${
                        minTier.id === "entry"
                          ? "tag-green"
                          : minTier.id === "standard"
                          ? "tag-amber"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {minTier.emoji} {minTier.name} tier+
                    </span>
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
