import { useCallback, useEffect, useMemo, useState } from "react";
import { intelligenceApi } from "../services/api";
import type { Story } from "../types/api";
import StoryCard from "../components/StoryCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { Search } from "lucide-react";

interface Props {
  refreshTick: number;
}

export default function Stories({ refreshTick }: Props) {
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    intelligenceApi
      .getStories()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((s) => s.category && set.add(s.category));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((s) => {
        if (category !== "all" && s.category !== category) return false;
        if (!q) return true;
        return (
          s.title?.toLowerCase().includes(q) ||
          s.summary?.toLowerCase().includes(q) ||
          s.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (b.editorial_score ?? 0) - (a.editorial_score ?? 0));
  }, [items, query, category]);

  if (loading && items.length === 0) return <LoadingState rows={6} />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-ink-subtle]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories…"
            className="w-full rounded-lg border border-[--color-border] bg-[--color-surface] py-2 pl-9 pr-3 text-sm text-[--color-ink] placeholder:text-[--color-ink-subtle] focus:border-[--color-accent] focus:outline-none"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm text-[--color-ink] focus:border-[--color-accent] focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="text-xs text-[--color-ink-subtle]">
        {filtered.length} of {items.length} stories
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No stories" description="No clustered stories match the current filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((s, i) => (
            <StoryCard key={s.id ?? i} story={s} />
          ))}
        </div>
      )}
    </div>
  );
}
