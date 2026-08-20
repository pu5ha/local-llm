export type NewsCategory = "models" | "hardware" | "research" | "tools" | "general";

export type NewsSourceKind =
  | "hf-models"
  | "hf-papers"
  | "github-releases"
  | "hacker-news"
  | "rss";

export interface NewsItem {
  title: string;
  url: string; // canonical external link, also used as the React key post-dedupe
  summary?: string;
  source: string; // display name, e.g. "Hugging Face", "GitHub — Ollama"
  sourceKind: NewsSourceKind;
  category: NewsCategory;
  publishedAt: string; // ISO 8601
  points?: number; // Hacker News score only
}

export type NewsMetaSource = "live" | "fallback-snapshot";

export interface NewsMeta {
  fetchedAt: string;
  source: NewsMetaSource;
  warning?: string;
}

export interface NewsFeed {
  items: NewsItem[];
  meta: NewsMeta;
}

export interface FallbackNewsSnapshot {
  generatedAt: string;
  items: NewsItem[];
}
