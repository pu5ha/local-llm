import "server-only";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS, FETCH_TIMEOUT_MS } from "../constants";
import type { NewsItem } from "../types";

const CURATED_REPOS = [
  { owner: "ollama", repo: "ollama", displayName: "Ollama" },
  { owner: "ggml-org", repo: "llama.cpp", displayName: "llama.cpp" },
  { owner: "vllm-project", repo: "vllm", displayName: "vLLM" },
  { owner: "oobabooga", repo: "text-generation-webui", displayName: "text-generation-webui" },
  { owner: "LostRuins", repo: "koboldcpp", displayName: "KoboldCpp" },
] as const;

interface GithubRelease {
  tag_name?: string;
  name?: string;
  html_url?: string;
  body?: string;
  draft?: boolean;
  published_at?: string;
  created_at?: string;
}

async function fetchOneRepo(entry: (typeof CURATED_REPOS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${entry.owner}/${entry.repo}/releases?per_page=5`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_TAG] },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as GithubRelease[];
    if (!Array.isArray(json)) return [];
    return json
      .filter((r) => !r.draft && r.html_url && (r.published_at ?? r.created_at))
      .slice(0, 5)
      .map((r) => ({
        title: `${entry.displayName} ${r.tag_name ?? r.name ?? ""}`.trim(),
        url: r.html_url as string,
        summary: r.body ? r.body.slice(0, 280) : undefined,
        source: `GitHub — ${entry.displayName}`,
        sourceKind: "github-releases" as const,
        category: "tools" as const,
        publishedAt: (r.published_at ?? r.created_at) as string,
      }));
  } catch {
    return [];
  }
}

export async function fetchGithubReleasesNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(CURATED_REPOS.map(fetchOneRepo));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
