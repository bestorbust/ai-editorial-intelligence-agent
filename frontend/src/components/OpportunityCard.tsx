import { useMemo } from "react";
import type { Opportunity } from "../types/api";

import {
  Sparkles,
  Tag,
  Building2,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";


interface Props {
  opportunity: Opportunity;
}


// =========================================================
// Score Tone
// Backend editorial score is 0–100
// =========================================================

function scoreTone(score?: number) {

  if (
    score === undefined ||
    score === null
  ) {
    return "muted";
  }

  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "mid";
  }

  return "low";
}


// =========================================================
// Opportunity Card
// =========================================================

export default function OpportunityCard({
  opportunity,
}: Props) {

  // ---------------------------------------------------------
  // Editorial Score
  // ---------------------------------------------------------

  const tone = scoreTone(
    opportunity.editorial_score
  );


  const scoreLabel = useMemo(() => {

    if (
      opportunity.editorial_score === undefined ||
      opportunity.editorial_score === null
    ) {
      return null;
    }

    return Math.round(
      opportunity.editorial_score
    );

  }, [opportunity.editorial_score]);


  // ---------------------------------------------------------
  // Safe Data
  // ---------------------------------------------------------

  const title =
    opportunity.title ||
    "Untitled Opportunity";


  const summary =
    opportunity.summary || "";


  const keywords =
    opportunity.keywords || [];


  const entities =
    opportunity.entities || [];


  const sources =
    opportunity.sources || [];


  const strengths =
    opportunity.strengths || [];


  const weaknesses =
    opportunity.weaknesses || [];


  const recommendedFormats =
    opportunity.recommended_formats || [];


  const category = (opportunity as any).category;


  // =========================================================
  // Render
  // =========================================================

  return (

    <article
      className="
        group
        flex
        h-full
        flex-col
        rounded-xl
        border
        border-[--color-border]
        bg-[--color-surface]
        p-5
        transition-all
        hover:border-[--color-border-strong]
        hover:shadow-[0_4px_24px_-8px_rgba(20,17,13,0.08)]
      "
    >

      {/* =====================================================
          Header
      ===================================================== */}

      <div
        className="
          mb-3
          flex
          items-start
          justify-between
          gap-3
        "
      >

        {/* Rank */}

        <div
          className="
            text-xs
            font-medium
            text-[--color-ink-subtle]
          "
        >

          Rank #{opportunity.rank}

        </div>


        {/* Editorial Score */}

        {scoreLabel !== null && (

          <div
            className={`
              flex
              items-center
              gap-1
              rounded-md
              px-2
              py-1
              text-xs
              font-semibold

              ${
                tone === "high"

                  ? `
                    bg-[--color-accent-soft]
                    text-[--color-accent-ink]
                  `

                  : tone === "mid"

                  ? `
                    bg-[--color-surface-muted]
                    text-[--color-ink]
                  `

                  : `
                    bg-[--color-surface-muted]
                    text-[--color-ink-muted]
                  `
              }
            `}
            title="Editorial score"
          >

            <Sparkles
              className="h-3 w-3"
            />

            {scoreLabel}

          </div>

        )}

      </div>


      {/* =====================================================
          Title
      ===================================================== */}

      <h3
        className="
          font-serif
          text-xl
          leading-snug
          text-[--color-ink]
        "
      >

        {title}

      </h3>


      {/* =====================================================
          Summary
      ===================================================== */}

      {summary && (

        <p
          className="
            mt-2
            line-clamp-4
            text-sm
            leading-relaxed
            text-[--color-ink-muted]
          "
        >

          {summary}

        </p>

      )}


      {/* =====================================================
          Meta Information
      ===================================================== */}

      {/* <div
        className="
          mt-4
          flex
          flex-wrap
          items-center
          gap-3
          text-xs
          text-[--color-ink-subtle]
        "
      >


        <div
          className="
            flex
            items-center
            gap-1
          "
          title="Articles in this story cluster"
        >

          <Newspaper
            className="h-3.5 w-3.5"
          />

          {opportunity.cluster_size} articles

        </div>



        {sources.length > 0 && (

          <div
            className="
              flex
              items-center
              gap-1
            "
            title="Number of sources"
          >

            <Building2
              className="h-3.5 w-3.5"
            />

            {sources.length} sources

          </div>

        )}

      </div> */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[--color-ink-subtle]">

  <div className="flex items-center gap-1">
    <Newspaper className="h-3.5 w-3.5" />
    <span>
      {opportunity.cluster_size ?? 0} Related Articles
    </span>
  </div>

  <div className="flex items-center gap-1">
    <Building2 className="h-3.5 w-3.5" />
    <span>
      {sources.length} Sources
    </span>
  </div>

  {category && (
    <span className="rounded-md bg-[--color-surface-muted] px-2 py-1">
      {category}
    </span>
  )}

</div>


      {/* =====================================================
          Sources
      ===================================================== */}

      {sources.length > 0 && (

        <div className="mt-4">

          <div
            className="
              mb-2
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[--color-ink-subtle]
            "
          >

            Sources

          </div>


          <div
            className="
              flex
              flex-wrap
              gap-1.5
            "
          >

            {sources
              .slice(0, 5)
              .map((source) => (

                <span
                  key={source}
                  className="
                    rounded-md
                    border
                    border-[--color-border]
                    bg-[--color-surface-muted]
                    px-2
                    py-1
                    text-[11px]
                    text-[--color-ink-muted]
                  "
                >

                  {source}

                </span>

              ))}

          </div>

        </div>

      )}


      {/* =====================================================
          Keywords
      ===================================================== */}

      {keywords.length > 0 && (

        <div className="mt-4">

          <div
            className="
              mb-2
              flex
              items-center
              gap-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[--color-ink-subtle]
            "
          >

            <Tag
              className="h-3 w-3"
            />

            Keywords

          </div>


          <div
            className="
              flex
              flex-wrap
              gap-1.5
            "
          >

            {keywords
              .slice(0, 6)
              .map((keyword) => (

                <span
                  key={keyword}
                  className="
                    rounded-md
                    border
                    border-[--color-border]
                    px-1.5
                    py-0.5
                    text-[11px]
                    text-[--color-ink-muted]
                  "
                >

                  {keyword}

                </span>

              ))}

          </div>

        </div>

      )}


      {/* =====================================================
          Entities
      ===================================================== */}

      {entities.length > 0 && (

        <div className="mt-4">

          <div
            className="
              mb-2
              flex
              items-center
              gap-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[--color-ink-subtle]
            "
          >

            <Users
              className="h-3 w-3"
            />

            Entities

          </div>


          <div
            className="
              flex
              flex-wrap
              gap-1.5
            "
          >

            {entities
              .slice(0, 5)
              .map((entity) => (

                <span
                  key={entity}
                  className="
                    rounded-md
                    bg-[--color-surface-muted]
                    px-1.5
                    py-0.5
                    text-[11px]
                    text-[--color-ink-muted]
                  "
                >

                  {entity}

                </span>

              ))}

          </div>

        </div>

      )}


      {/* =====================================================
          Strengths
      ===================================================== */}

      {strengths.length > 0 && (

        <div className="mt-4">

          <div
            className="
              mb-2
              flex
              items-center
              gap-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[--color-ink-subtle]
            "
          >

            <CheckCircle2
              className="h-3 w-3"
            />

            Strengths

          </div>


          <ul
            className="
              space-y-1
              text-xs
              leading-relaxed
              text-[--color-ink-muted]
            "
          >

            {strengths
              .slice(0, 3)
              .map((strength, index) => (

                <li
                  key={`${strength}-${index}`}
                >

                  • {strength}

                </li>

              ))}

          </ul>

        </div>

      )}


      {/* =====================================================
          Weaknesses
      ===================================================== */}

      {weaknesses.length > 0 && (

        <div className="mt-4">

          <div
            className="
              mb-2
              flex
              items-center
              gap-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[--color-ink-subtle]
            "
          >

            <AlertCircle
              className="h-3 w-3"
            />

            Weaknesses

          </div>


          <ul
            className="
              space-y-1
              text-xs
              leading-relaxed
              text-[--color-ink-muted]
            "
          >

            {weaknesses
              .slice(0, 2)
              .map((weakness, index) => (

                <li
                  key={`${weakness}-${index}`}
                >

                  • {weakness}

                </li>

              ))}

          </ul>

        </div>

      )}


      {/* =====================================================
          Recommended Formats
      ===================================================== */}

      {recommendedFormats.length > 0 && (

        <div
          className="
            mt-auto
            pt-5
          "
        >

          <div
            className="
              mb-2
              flex
              items-center
              gap-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[--color-ink-subtle]
            "
          >

            <FileText
              className="h-3 w-3"
            />

            Recommended

          </div>


          <div
            className="
              flex
              flex-wrap
              gap-1.5
            "
          >

            {recommendedFormats.map(
              (format) => (

                <span
                  key={format}
                  className="
                    rounded-md
                    bg-[--color-accent-soft]
                    px-2
                    py-1
                    text-[11px]
                    font-medium
                    text-[--color-accent-ink]
                  "
                >

                  {format}

                </span>

              )
            )}

          </div>

        </div>

      )}

    </article>

  );

}