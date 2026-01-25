import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocalLLM - Run AI Models Privately on Your Machine",
  description:
    "The easiest way to run LLMs locally. Keep your conversations private with step-by-step guides for Ollama, LM Studio, and more.",
  keywords: [
    "local LLM",
    "private AI",
    "Ollama",
    "LM Studio",
    "llama.cpp",
    "run AI locally",
    "privacy",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
