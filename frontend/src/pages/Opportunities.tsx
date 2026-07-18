import { useCallback, useEffect, useMemo, useState } from "react";
import { intelligenceApi } from "../services/api";
import type { Opportunity } from "../types/api";

import OpportunityCard from "../components/OpportunityCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import {
  Search,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from "lucide-react";


interface Props {
  refreshTick: number;
}


type SortMode = "score-desc" | "score-asc";


export default function Opportunities({ refreshTick }: Props) {

  // =========================================================
  // State
  // =========================================================

  const [items, setItems] = useState<Opportunity[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const [sort, setSort] = useState<SortMode>("score-desc");


  // =========================================================
  // Load Opportunities
  // =========================================================

  const load = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

      const data = await intelligenceApi.getOpportunities();

      // Safety check:
      // Backend /opportunities should return an array.
      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid opportunities response: expected an array."
        );
      }

      setItems(data);

    } catch (e) {

      console.error(
        "Failed to load opportunities:",
        e
      );

      setError(
        e instanceof Error
          ? e.message
          : "Failed to load opportunities"
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // =========================================================
  // Initial Load + Reload After Refresh
  // =========================================================

  useEffect(() => {

    load();

  }, [load, refreshTick]);


  // =========================================================
  // Search + Sort
  // =========================================================

  const filtered = useMemo(() => {

    const q = query
      .trim()
      .toLowerCase();


    // ---------------------------------------------------------
    // Search
    // ---------------------------------------------------------

    let list = items.filter((opportunity) => {

      // No search query → include everything
      if (!q) {
        return true;
      }


      // Search title
      const titleMatch =
        opportunity.title
          ?.toLowerCase()
          .includes(q);


      // Search summary
      const summaryMatch =
        opportunity.summary
          ?.toLowerCase()
          .includes(q);


      // Search keywords
      const keywordMatch =
        opportunity.keywords
          ?.some((keyword) =>
            keyword
              .toLowerCase()
              .includes(q)
          );


      // Search entities
      const entityMatch =
        opportunity.entities
          ?.some((entity) =>
            entity
              .toLowerCase()
              .includes(q)
          );


      // Search sources
      const sourceMatch =
        opportunity.sources
          ?.some((source) =>
            source
              .toLowerCase()
              .includes(q)
          );


      return Boolean(
        titleMatch ||
        summaryMatch ||
        keywordMatch ||
        entityMatch ||
        sourceMatch
      );

    });


    // ---------------------------------------------------------
    // Sort by Editorial Score
    // ---------------------------------------------------------

    list = [...list].sort(
      (a, b) => {

        const scoreA =
          a.editorial_score ?? 0;

        const scoreB =
          b.editorial_score ?? 0;


        if (sort === "score-desc") {

          return scoreB - scoreA;

        }

        return scoreA - scoreB;

      }
    );


    return list;

  }, [
    items,
    query,
    sort,
  ]);


  // =========================================================
  // Initial Loading State
  // =========================================================

  if (
    loading &&
    items.length === 0
  ) {

    return (
      <LoadingState rows={6} />
    );

  }


  // =========================================================
  // Initial Error State
  // =========================================================

  if (
    error &&
    items.length === 0
  ) {

    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );

  }


  // =========================================================
  // Render
  // =========================================================

  return (

    <div className="space-y-5">

      {/* =====================================================
          Search + Sort Controls
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        {/* Search */}

        <div className="relative flex-1">

          <Search
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-[--color-ink-subtle]
            "
          />

          <input
            type="search"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search opportunities, keywords, entities, sources…"
            className="
              w-full
              rounded-lg
              border
              border-[--color-border]
              bg-[--color-surface]
              py-2
              pl-9
              pr-3
              text-sm
              text-[--color-ink]
              placeholder:text-[--color-ink-subtle]
              focus:border-[--color-accent]
              focus:outline-none
            "
          />

        </div>


        {/* Sort */}

        <button
          type="button"
          onClick={() =>
            setSort((current) =>
              current === "score-desc"
                ? "score-asc"
                : "score-desc"
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-[--color-border]
            bg-[--color-surface]
            px-3
            py-2
            text-sm
            font-medium
            text-[--color-ink]
            hover:bg-[--color-surface-muted]
          "
        >

          {sort === "score-desc" ? (

            <ArrowDownWideNarrow
              className="h-3.5 w-3.5"
            />

          ) : (

            <ArrowUpWideNarrow
              className="h-3.5 w-3.5"
            />

          )}

          Score

        </button>

      </div>


      {/* =====================================================
          Result Count
      ===================================================== */}

      <div className="flex items-center justify-between">

        <div className="text-xs text-[--color-ink-subtle]">

          {filtered.length} of{" "}
          {items.length} opportunities

        </div>


        {/* Show background refresh state */}

        {loading &&
          items.length > 0 && (

            <div className="text-xs text-[--color-ink-subtle]">

              Refreshing...

            </div>

          )}

      </div>


      {/* =====================================================
          Background Error
      ===================================================== */}

      {error &&
        items.length > 0 && (

          <div
            className="
              rounded-lg
              border
              border-[--color-border]
              bg-[--color-surface-muted]
              px-4
              py-3
              text-sm
              text-[--color-ink-muted]
            "
          >

            Failed to refresh opportunities:{" "}
            {error}

          </div>

        )}


      {/* =====================================================
          Opportunities Grid
      ===================================================== */}

      {filtered.length === 0 ? (

        <EmptyState
          title={
            items.length === 0
              ? "No opportunities available"
              : "No opportunities match"
          }
          description={
            items.length === 0
              ? "Run the intelligence pipeline to discover editorial opportunities."
              : "Try clearing or changing your search terms."
          }
        />

      ) : (

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {filtered.map(
            (opportunity) => (

              <OpportunityCard
                key={`${opportunity.cluster_id}-${opportunity.rank}`}
                opportunity={opportunity}
              />

            )
          )}

        </div>

      )}

    </div>

  );

}