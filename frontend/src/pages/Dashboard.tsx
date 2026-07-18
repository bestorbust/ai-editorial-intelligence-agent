import { useCallback, useEffect, useState } from "react";
import { intelligenceApi } from "../services/api";
import type { DashboardData, StatusData } from "../types/api";
import StatCard from "../components/StatCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { FileText, Layers, Newspaper, Lightbulb, CheckCircle2, Loader2 } from "lucide-react";
import { formatDateTime, formatRelative } from "../lib/format";

interface Props {
  status: StatusData | null;
  refreshing: boolean;
  refreshTick: number;
}

export default function Dashboard({ status, refreshing, refreshTick }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    intelligenceApi
      .getDashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  const pipelineRefreshing = refreshing || !!data?.refreshing;

  return (
    <div className="space-y-6">
      {loading && !data ? (
        <LoadingState variant="stats" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Raw Articles"
            value={data?.raw_articles}
            description="Ingested from source feeds"
            icon={FileText}
          />
          <StatCard
            label="Semantic Unique"
            value={data?.semantic_unique}
            description="Distinct topics after dedup"
            icon={Layers}
          />
          <StatCard
            label="Stories"
            value={data?.stories}
            description="Clustered narratives"
            icon={Newspaper}
          />
          <StatCard
            label="Opportunities"
            value={data?.opportunities}
            description="Editorial angles generated"
            icon={Lightbulb}
            accent
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[--color-ink]">System Status</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                pipelineRefreshing
                  ? "bg-[--color-accent-soft] text-[--color-accent-ink]"
                  : "bg-emerald-50 text-[--color-success]"
              }`}
            >
              {pipelineRefreshing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Intelligence pipeline is updating…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Intelligence data is up to date
                </>
              )}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[--color-ink-subtle]">
                Latest snapshot
              </dt>
              <dd className="mt-1 font-serif text-2xl text-[--color-ink]">
                #{data?.snapshot ?? status?.snapshot ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[--color-ink-subtle]">
                Last updated
              </dt>
              <dd className="mt-1 text-sm font-medium text-[--color-ink]">
                {formatRelative(data?.last_updated ?? status?.last_updated)}
              </dd>
              <dd className="text-xs text-[--color-ink-subtle]">
                {formatDateTime(data?.last_updated ?? status?.last_updated)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[--color-ink-subtle]">
                Pipeline
              </dt>
              <dd className="mt-1 text-sm font-medium text-[--color-ink]">
                {pipelineRefreshing ? "Running" : "Idle"}
              </dd>
              <dd className="text-xs text-[--color-ink-subtle]">Auto-refresh every ~15 min</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[--color-ink]">About this snapshot</h2>
          <p className="text-sm leading-relaxed text-[--color-ink-muted]">
            The backend ingests articles, dedupes them semantically, clusters them into stories, and
            generates editorial opportunities. Use{" "}
            <span className="font-medium text-[--color-ink]">Get Latest Updates</span> to trigger a
            new pipeline run — otherwise data is served from the latest cached snapshot.
          </p>
        </div>
      </div>
    </div>
  );
}
