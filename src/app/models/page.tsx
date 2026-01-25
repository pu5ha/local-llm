"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Cpu, Zap, HardDrive, X } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { models, Model } from "@/data/models";

const providers = [...new Set(models.map((m) => m.provider))];
const ramOptions = ["4GB", "8GB", "16GB+"];

export default function ModelsPage() {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedRam, setSelectedRam] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.provider.toLowerCase().includes(search.toLowerCase()) ||
        model.description.toLowerCase().includes(search.toLowerCase());

      const matchesProvider =
        !selectedProvider || model.provider === selectedProvider;

      const matchesRam = !selectedRam || (() => {
        if (selectedRam === "4GB") return model.ramRequiredGB <= 4;
        if (selectedRam === "8GB") return model.ramRequiredGB <= 8;
        if (selectedRam === "16GB+") return model.ramRequiredGB <= 16;
        return true;
      })();

      return matchesSearch && matchesProvider && matchesRam;
    });
  }, [search, selectedProvider, selectedRam]);

  const clearFilters = () => {
    setSelectedProvider(null);
    setSelectedRam(null);
    setSearch("");
  };

  const hasActiveFilters = selectedProvider || selectedRam || search;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Browse <span className="gradient-text">Models</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            Explore the best open-source LLMs you can run locally. Filter by
            your available RAM to find models that work on your machine.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {/* Filters */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } sm:flex flex-wrap gap-4 items-center`}
          >
            {/* Provider Filter */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              <span className="text-sm text-muted self-center mr-2">Provider:</span>
              {providers.map((provider) => (
                <button
                  key={provider}
                  onClick={() =>
                    setSelectedProvider(
                      selectedProvider === provider ? null : provider
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedProvider === provider
                      ? "bg-primary text-white"
                      : "bg-card border border-border hover:border-primary"
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>

            {/* RAM Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted self-center mr-2">RAM:</span>
              {ramOptions.map((ram) => (
                <button
                  key={ram}
                  onClick={() =>
                    setSelectedRam(selectedRam === ram ? null : ram)
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedRam === ram
                      ? "bg-primary text-white"
                      : "bg-card border border-border hover:border-primary"
                  }`}
                >
                  {ram}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="ml-auto">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted">
          Showing {filteredModels.length} of {models.length} models
        </div>

        {/* Models Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>

        {/* No Results */}
        {filteredModels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Cpu className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No models found</h3>
            <p className="text-muted mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ModelCard({ model, index }: { model: Model; index: number }) {
  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted">{model.provider}</span>
            </div>
            <h3 className="text-lg font-semibold">
              {model.name}{" "}
              <span className="text-muted font-normal">{model.parameters}</span>
            </h3>
          </div>
          <Badge
            variant={
              model.quality === "excellent"
                ? "success"
                : model.quality === "great"
                ? "primary"
                : "default"
            }
          >
            {model.quality}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted mb-4">{model.description}</p>

        {/* Best For Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {model.bestFor.map((use) => (
            <Badge key={use} variant="default">
              {use}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <HardDrive className="w-4 h-4 text-muted mx-auto mb-1" />
            <div className="text-xs text-muted">RAM</div>
            <div className="text-sm font-medium">{model.ramRequired}</div>
          </div>
          <div className="text-center">
            <Zap className="w-4 h-4 text-muted mx-auto mb-1" />
            <div className="text-xs text-muted">Speed</div>
            <div className="text-sm font-medium capitalize">{model.speed}</div>
          </div>
          <div className="text-center">
            <Cpu className="w-4 h-4 text-muted mx-auto mb-1" />
            <div className="text-xs text-muted">Params</div>
            <div className="text-sm font-medium">{model.parameters}</div>
          </div>
        </div>

        {/* Ollama Command */}
        {model.ollamaName && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted mb-2">Ollama command:</div>
            <code className="block bg-[#0d0d12] px-3 py-2 rounded text-sm font-mono text-primary">
              ollama run {model.ollamaName}
            </code>
          </div>
        )}
      </motion.div>
    </Card>
  );
}
