import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "PrivateAI — Your AI Conversations, Seen By No One",
  description:
    "Run powerful open-source AI models on your own computer — private by design, free forever. No subscriptions, no data collection, nobody reading your chats. Step-by-step setup, even if you've never used a terminal.",
  keywords: [
    "private AI",
    "AI privacy",
    "run AI locally",
    "local LLM",
    "Ollama",
    "ChatGPT alternative",
    "offline AI",
    "free AI",
  ],
};

const themeInitScript = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var theme = stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <Navigation />
        <main className="pt-16">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
