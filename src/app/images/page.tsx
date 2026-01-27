"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Lock, Sparkles, Bell } from "lucide-react";

export default function ImagesComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-primary-pale flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Badge */}
          <div className="stamp mx-auto mb-6">
            <Lock className="w-4 h-4" />
            Coming Soon
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl mb-4">
            Private AI Image Creation
          </h1>

          <p className="text-lg text-muted mb-8 leading-relaxed">
            Soon you'll be able to create images with AI, completely privately
            on your own computer. No cloud services, no one watching what you create.
          </p>

          {/* What's coming */}
          <div className="paper-card p-6 text-left mb-8">
            <h3 className="font-semibold mb-4 text-center">What's Coming</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-pale text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
                <span>Turn your descriptions into images using AI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-pale text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
                <span>Everything runs on your computer - totally private</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-pale text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
                <span>No subscriptions, no credits - unlimited creations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-pale text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">4</span>
                <span>Simple step-by-step setup guide</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/"
              className="btn-primary inline-flex justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Start with Private Chat Instead
            </Link>
            <p className="text-sm text-muted">
              In the meantime, you can set up private AI chat - it works great!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
