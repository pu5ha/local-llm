import type { NewsItem } from "@/lib/news/types";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatNewsItemMessage(item: NewsItem): string {
  const lines = [`<b>${escapeHtml(item.title)}</b>`, escapeHtml(item.source)];
  if (item.summary) lines.push(escapeHtml(item.summary));
  lines.push(item.url);
  return lines.join("\n");
}
