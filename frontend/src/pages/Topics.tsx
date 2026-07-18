import { useCallback, useEffect, useMemo, useState } from "react";
import { intelligenceApi } from "../services/api";
import type { Topic } from "../types/api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { Search, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { formatRelative } from "../lib/format";

interface Props {
  refreshTick: number;
}

export default function Topics({ refreshTick }: Props) {
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    intelligenceApi
      .getTopics()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    items.forEach((t) => t.source && set.add(t.source));
    return Array.from(set).sort();
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((t) => t.category && set.add(t.category));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (source !== "all" && t.source !== source) return false;
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title?.toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.toLowerCase().includes(q)) ||
        t.entities?.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [items, query, source, category]);

  if (loading && items.length === 0) return <LoadingState variant="list" rows={10} />;
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
            placeholder="Search topics, keywords, entities…"
            className="w-full rounded-lg border border-[--color-border] bg-[--color-surface] py-2 pl-9 pr-3 text-sm text-[--color-ink] placeholder:text-[--color-ink-subtle] focus:border-[--color-accent] focus:outline-none"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm text-[--color-ink] focus:border-[--color-accent] focus:outline-none"
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
        {filtered.length} of {items.length} topics
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No topics" description="Try adjusting search or filters." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface]">
          <div className="hidden grid-cols-[1fr_140px_140px_100px_100px_40px] gap-4 border-b border-[--color-border] bg-[--color-surface-muted] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[--color-ink-subtle] md:grid">
            <div>Title</div>
            <div>Source</div>
            <div>Category</div>
            <div className="text-right">Trend</div>
            <div className="text-right">Discovered</div>
            <div />
          </div>
          <ul className="divide-y divide-[--color-border]">
            {filtered.map((t, i) => {
              const id = t.id ?? i;
              const isOpen = expanded === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : id)}
                    className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left hover:bg-[--color-surface-muted] md:grid-cols-[1fr_140px_140px_100px_100px_40px] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[--color-ink]">
                        {t.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[--color-ink-subtle] md:hidden">
                        <span>{t.source}</span>
                        {t.category && <span>· {t.category}</span>}
                      </div>
                    </div>
                    <div className="hidden truncate text-xs text-[--color-ink-muted] md:block">
                      {t.source}
                    </div>
                    <div className="hidden truncate text-xs text-[--color-ink-muted] md:block">
                      {t.category || "—"}
                    </div>
                    <div className="hidden text-right text-xs tabular-nums text-[--color-ink-muted] md:block">
                      {t.trend_score !== undefined ? t.trend_score.toFixed(2) : "—"}
                    </div>
                    <div className="hidden text-right text-xs text-[--color-ink-subtle] md:block">
                      {formatRelative(t.discovered_at)}
                    </div>
                    <div className="hidden justify-end text-[--color-ink-subtle] md:flex">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[--color-border] bg-[--color-surface-muted] px-4 py-4">
                      {t.summary && (
                        <p className="mb-3 text-sm leading-relaxed text-[--color-ink]">
                          {t.summary}
                        </p>
                      )}
                      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        {t.confidence_score !== undefined && (
                          <div>
                            <dt className="text-[--color-ink-subtle]">Confidence</dt>
                            <dd className="font-medium text-[--color-ink] tabular-nums">
                              {t.confidence_score.toFixed(2)}
                            </dd>
                          </div>
                        )}
                        {t.trend_score !== undefined && (
                          <div>
                            <dt className="text-[--color-ink-subtle]">Trend</dt>
                            <dd className="font-medium text-[--color-ink] tabular-nums">
                              {t.trend_score.toFixed(2)}
                            </dd>
                          </div>
                        )}
                        {t.language && (
                          <div>
                            <dt className="text-[--color-ink-subtle]">Language</dt>
                            <dd className="font-medium text-[--color-ink]">{t.language}</dd>
                          </div>
                        )}
                        {t.country && (
                          <div>
                            <dt className="text-[--color-ink-subtle]">Country</dt>
                            <dd className="font-medium text-[--color-ink]">{t.country}</dd>
                          </div>
                        )}
                      </dl>

                      {t.keywords && t.keywords.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[--color-ink-subtle]">
                            Keywords
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {t.keywords.map((k) => (
                              <span
                                key={k}
                                className="rounded-md border border-[--color-border] bg-[--color-surface] px-1.5 py-0.5 text-[11px] text-[--color-ink-muted]"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {t.entities && t.entities.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[--color-ink-subtle]">
                            Entities
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {t.entities.map((e) => (
                              <span
                                key={e}
                                className="rounded-md bg-[--color-accent-soft] px-1.5 py-0.5 text-[11px] text-[--color-accent-ink]"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {t.source_url && (
                        <a
                          href={t.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[--color-accent-ink] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View source
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
