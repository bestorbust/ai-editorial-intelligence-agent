import { useCallback, useEffect, useState } from "react";
import { intelligenceApi } from "../services/api";
import type { HistorySnapshot } from "../types/api";
import { formatDateTime } from "../lib/format";
import { Clock, FileText, Layers, Newspaper, Lightbulb } from "lucide-react";

export default function History() {
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await intelligenceApi.getHistory(
        selectedDate || undefined
      );

      setHistory(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[--color-ink]">
            Snapshot History
          </h1>

          <p className="mt-1 text-sm text-[--color-ink-muted]">
            Browse previous intelligence pipeline runs.
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm text-[--color-ink]"
        />
      </div>

      {/* Loading */}

      {loading && (
        <div className="py-12 text-center text-sm text-[--color-ink-muted]">
          Loading snapshot history...
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty */}

      {!loading && !error && history.length === 0 && (
        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-10 text-center">
          <p className="text-sm text-[--color-ink-muted]">
            No snapshots found for this date.
          </p>
        </div>
      )}

      {/* Snapshots */}

      {!loading && !error && history.length > 0 && (
        <div className="space-y-4">
          {history.map((snapshot) => (
            <div
              key={snapshot.id}
              className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-serif text-xl text-[--color-ink]">
                    Snapshot #{snapshot.id}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[--color-ink-subtle]">
                    <Clock className="h-3.5 w-3.5" />

                    {formatDateTime(snapshot.created_at)}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[--color-ink-subtle]">
                    Pipeline time
                  </p>

                  <p className="text-sm font-medium text-[--color-ink]">
                    {snapshot.pipeline_time.toFixed(1)}s
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                <Metric
                  icon={FileText}
                  label="Raw Articles"
                  value={snapshot.raw_collected}
                />

                <Metric
                  icon={Layers}
                  label="Semantic Unique"
                  value={snapshot.semantic_unique}
                />

                <Metric
                  icon={Newspaper}
                  label="Stories"
                  value={snapshot.stories}
                />

                <Metric
                  icon={Lightbulb}
                  label="Opportunities"
                  value={snapshot.opportunities}
                />

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-[--color-ink-subtle]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <p className="mt-1 text-lg font-semibold text-[--color-ink]">
        {value}
      </p>
    </div>
  );
}