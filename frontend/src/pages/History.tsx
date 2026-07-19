import { useCallback, useEffect, useMemo, useState } from "react";
import { intelligenceApi } from "../services/api";
import type { HistorySnapshot } from "../types/api";
import { formatDateTime } from "../lib/format";
import {
  Clock,
  FileText,
  Layers,
  Newspaper,
  Lightbulb,
} from "lucide-react";

// ============================================================
// DATE HELPERS
// ============================================================

// Get YYYY-MM-DD in Asia/Kolkata
function istDateFromDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year =
    parts.find((part) => part.type === "year")?.value ?? "1970";

  const month =
    parts.find((part) => part.type === "month")?.value ?? "01";

  const day =
    parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}


// Today's date in IST
function todayISTString(): string {
  return istDateFromDate(new Date());
}


// Convert backend timestamp to IST YYYY-MM-DD
function istDateString(iso: string): string {
  // PostgreSQL / backend may return:
  //
  // 2026-07-19T10:30:00
  //
  // or
  //
  // 2026-07-19T10:30:00Z

  const hasTimezone =
    /Z$|[+-]\d{2}:\d{2}$/.test(iso);

  const date = new Date(
    hasTimezone
      ? iso
      : `${iso}Z`
  );

  return istDateFromDate(date);
}


// Shift YYYY-MM-DD by number of days
function shiftDate(
  iso: string,
  days: number
): string {

  const [year, month, day] =
    iso.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}


// ============================================================
// HISTORY PAGE
// ============================================================

export default function History() {

  const [history, setHistory] =
    useState<HistorySnapshot[]>([]);

  // Default selected date = Today in IST
  const [selectedDate, setSelectedDate] =
    useState<string>(() => todayISTString());

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // ============================================================
  // LOAD HISTORY
  // ============================================================

  const loadHistory =
    useCallback(async () => {

      setLoading(true);
      setError(null);

      try {

        const target =
          selectedDate ||
          todayISTString();


        /*
         * Fetch neighboring dates.
         *
         * Reason:
         * Backend timestamps are UTC,
         * while frontend groups snapshots
         * using Asia/Kolkata timezone.
         *
         * Fetching:
         *
         * previous day
         * selected day
         * next day
         *
         * prevents snapshots near midnight
         * from disappearing.
         */

        const days = [
          shiftDate(target, -1),
          target,
          shiftDate(target, 1),
        ];


        const results =
          await Promise.all(

            days.map((date) =>

              intelligenceApi
                .getHistory(date)

                .catch(
                  () =>
                    [] as HistorySnapshot[]
                )

            )

          );


        // Prevent duplicate snapshots
        const seen =
          new Set<number>();


        const merged:
          HistorySnapshot[] = [];


        for (const list of results) {

          for (const snapshot of list) {

            // Already added
            if (
              seen.has(snapshot.id)
            ) {
              continue;
            }


            // Only snapshots belonging
            // to selected IST date
            if (
              istDateString(
                snapshot.created_at
              ) !== target
            ) {
              continue;
            }


            seen.add(
              snapshot.id
            );


            merged.push(
              snapshot
            );

          }

        }


        /*
         * Display newest snapshot first.
         *
         * Example:
         *
         * Snapshot #3  ← newest
         * Snapshot #2
         * Snapshot #1  ← oldest
         */

        merged.sort(
          (a, b) =>

            new Date(
              b.created_at
            ).getTime()

            -

            new Date(
              a.created_at
            ).getTime()
        );


        setHistory(
          merged
        );

      }

      catch (err) {

        setError(

          err instanceof Error

            ? err.message

            : "Failed to load history"

        );

      }

      finally {

        setLoading(false);

      }

    }, [selectedDate]);


  // ============================================================
  // LOAD WHEN DATE CHANGES
  // ============================================================

  useEffect(() => {

    loadHistory();

  }, [loadHistory]);


  // ============================================================
  // DAILY SNAPSHOT NUMBERS
  // ============================================================

  /*
   * Database snapshot IDs remain global.
   *
   * Example:
   *
   * DB ID 21 → July 18
   * DB ID 22 → July 18
   * DB ID 23 → July 19
   * DB ID 24 → July 19
   *
   * UI displays:
   *
   * July 18
   * Snapshot #1
   * Snapshot #2
   *
   * July 19
   * Snapshot #1
   * Snapshot #2
   *
   * We do NOT modify database IDs.
   */

  const snapshotNumbers =
    useMemo(() => {

      const map =
        new Map<number, number>();


      // Sort oldest → newest
      const chronological =
        [...history].sort(

          (a, b) =>

            new Date(
              a.created_at
            ).getTime()

            -

            new Date(
              b.created_at
            ).getTime()

        );


      chronological.forEach(
        (snapshot, index) => {

          map.set(
            snapshot.id,
            index + 1
          );

        }
      );


      return map;

    }, [history]);


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h1
            className="
              font-serif
              text-2xl
              text-[--color-ink]
            "
          >
            Snapshot History
          </h1>


          <p
            className="
              mt-1
              text-sm
              text-[--color-ink-muted]
            "
          >
            Browse previous intelligence pipeline runs.
          </p>

        </div>


        <input

          type="date"

          value={
            selectedDate
          }

          onChange={
            (event) =>
              setSelectedDate(
                event.target.value
              )
          }

          className="
            rounded-lg
            border
            border-[--color-border]
            bg-[--color-surface]
            px-3
            py-2
            text-sm
            text-[--color-ink]
          "

        />

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div
          className="
            py-12
            text-center
            text-sm
            text-[--color-ink-muted]
          "
        >
          Loading snapshot history...
        </div>

      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading &&
        error && (

          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-700
            "
          >
            {error}
          </div>

        )}


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        !error &&
        history.length === 0 && (

          <div
            className="
              rounded-xl
              border
              border-[--color-border]
              bg-[--color-surface]
              p-10
              text-center
            "
          >

            <p
              className="
                text-sm
                text-[--color-ink-muted]
              "
            >
              No snapshots found for this date.
            </p>

          </div>

        )}


      {/* ======================================================
          SNAPSHOTS
      ====================================================== */}

      {!loading &&
        !error &&
        history.length > 0 && (

          <div className="space-y-4">

            {history.map(
              (snapshot) => {

                const displayNumber =
                  snapshotNumbers.get(
                    snapshot.id
                  ) ?? 1;


                return (

                  <div

                    key={
                      snapshot.id
                    }

                    className="
                      rounded-xl
                      border
                      border-[--color-border]
                      bg-[--color-surface]
                      p-5
                    "

                  >

                    {/* Snapshot Header */}

                    <div
                      className="
                        mb-5
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div>

                        <p
                          className="
                            font-serif
                            text-xl
                            text-[--color-ink]
                          "
                        >

                          Snapshot #{displayNumber}

                        </p>


                        <div
                          className="
                            mt-1
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            text-[--color-ink-subtle]
                          "
                        >

                          <Clock
                            className="
                              h-3.5
                              w-3.5
                            "
                          />


                          {formatDateTime(
                            snapshot.created_at
                          )}

                        </div>

                      </div>


                      {/* Pipeline Time */}

                      <div className="text-right">

                        <p
                          className="
                            text-xs
                            text-[--color-ink-subtle]
                          "
                        >
                          Pipeline time
                        </p>


                        <p
                          className="
                            text-sm
                            font-medium
                            text-[--color-ink]
                          "
                        >

                          {Number(
                            snapshot.pipeline_time ?? 0
                          ).toFixed(1)}
                          s

                        </p>

                      </div>

                    </div>


                    {/* ==================================================
                        METRICS
                    ================================================== */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-4
                        md:grid-cols-4
                      "
                    >

                      <Metric

                        icon={
                          FileText
                        }

                        label="
                          Raw Articles
                        "

                        value={
                          snapshot.raw_collected
                        }

                      />


                      <Metric

                        icon={
                          Layers
                        }

                        label="
                          Semantic Unique
                        "

                        value={
                          snapshot.semantic_unique
                        }

                      />


                      <Metric

                        icon={
                          Newspaper
                        }

                        label="
                          Stories
                        "

                        value={
                          snapshot.stories
                        }

                      />


                      <Metric

                        icon={
                          Lightbulb
                        }

                        label="
                          Opportunities
                        "

                        value={
                          snapshot.opportunities
                        }

                      />

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

    </div>

  );

}


// ============================================================
// METRIC COMPONENT
// ============================================================

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

      <div
        className="
          flex
          items-center
          gap-1.5
          text-xs
          text-[--color-ink-subtle]
        "
      >

        <Icon
          className="
            h-3.5
            w-3.5
          "
        />

        {label}

      </div>


      <p
        className="
          mt-1
          text-lg
          font-semibold
          text-[--color-ink]
        "
      >

        {value}

      </p>

    </div>

  );

}