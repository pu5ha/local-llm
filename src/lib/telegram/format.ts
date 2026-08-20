import type { NewsItem } from "@/lib/news/types";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatNewsItemMessage(item: NewsItem): string {
  const title = item.plainTitle ?? item.title;
  const summary = item.plainSummary ?? item.summary;
  const lines = [`<b>${escapeHtml(title)}</b>`, escapeHtml(item.source)];
  if (summary) lines.push(escapeHtml(summary));
  lines.push(item.url);
  return lines.join("\n");
}
