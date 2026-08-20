"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Cpu,
  CircuitBoard,
  FlaskConical,
  Wrench,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { NewsItem, NewsCategory, NewsMeta } from "@/lib/news/types";
import { formatRelativeTime } from "@/lib/news/formatRelativeTime";

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  models: "Models",
  hardware: "Hardware",
  research: "Research & Breakthroughs",
  tools: "Tools & Updates",
  general: "General",
};

const CATEGORY_TAG_CLASS: Record<NewsCategory, string> = {
  models: "tag-green",
  hardware: "tag-blue",
  research: "tag-violet",
  tools: "tag-amber",
  general: "bg-background-alt text-muted",
};

const CATEGORY_ICONS: Record<NewsCategory, React.ElementType> = {
  models: Cpu,
  hardware: CircuitBoard,
  research: FlaskConical,
  tools: Wrench,
  general: Newspaper,
};

const CATEGORY_ORDER: NewsCategory[] = ["models", "hardware", "research", "tools", "general"];

export default function NewsBrowser({
  items,
  meta,
}: {
  items: NewsItem[];
  meta: NewsMeta;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = search.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        (item.plainTitle?.toLowerCase().includes(query) ?? false) ||
        item.source.toLowerCase().includes(query) ||
        (item.summary?.toLowerCase().includes(query) ?? false) ||
        (item.plainSummary?.toLowerCase().includes(query) ?? false);

      const matchesCategory = !selectedCategory || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearch("");
  };

  const hasActiveFilters = selectedCategory || search;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">
            Latest in <span className="text-primary">Local AI</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            New models, tools, research, and hardware for running AI on your
            own machine — pulled automatically from Hugging Face, GitHub,
            Hacker News, and a few trusted blogs.
          </p>
        </motion.div>

        {meta.source === "fallback-snapshot" && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted">
            <span className="tag tag-amber">Cached</span>
            Showing last-known-good news — live sources are temporarily
            unavailable.
          </div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-white"
                  : "bg-card border border-border hover:border-primary"
              }`}
            >
              All
            </button>
            {CATEGORY_ORDER.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category ? null : category)
                }
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-card border border-border hover:border-primary"
                }`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="ml-auto">
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted">
          Showing {filteredItems.length} of {items.length} stories
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredItems.map((item, i) => (
            <NewsRow key={item.url} item={item} index={i} />
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Newspaper className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No news found</h3>
            <p className="text-muted mb-4">Try adjusting your search or filters</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NewsRow({ item, index }: { item: NewsItem; index: number }) {
  const Icon = CATEGORY_ICONS[item.category];
  const tagClass = CATEGORY_TAG_CLASS[item.category];

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.03 }}
      className="paper-card p-5 block group"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-primary mt-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
              {item.plainTitle ?? item.title}
            </h3>
            <ExternalLink className="w-4 h-4 text-muted shrink-0 mt-1" />
          </div>
          <div className="text-xs text-muted mt-1">
            {item.source} · {formatRelativeTime(item.publishedAt)}
          </div>
          {(item.plainSummary ?? item.summary) && (
            <p className="text-sm text-muted mt-2 line-clamp-2">
              {item.plainSummary ?? item.summary}
            </p>
          )}
          <div className="mt-3">
            <span className={`tag ${tagClass}`}>{CATEGORY_LABELS[item.category]}</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
