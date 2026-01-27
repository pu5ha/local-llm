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
  title: "PrivateAI - Run AI on Your Computer. Private. Free. Forever.",
  description:
    "The easiest way to run AI privately on your own computer. No subscriptions, no data collection, complete privacy. Simple step-by-step guides for anyone.",
  keywords: [
    "private AI",
    "AI privacy",
    "run AI locally",
    "ChatGPT alternative",
    "offline AI",
    "free AI",
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
