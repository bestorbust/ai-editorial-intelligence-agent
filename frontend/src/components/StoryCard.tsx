import { useState } from "react";
import type { Story } from "../types/api";
import { ChevronDown, ChevronUp, Layers, Sparkles, ExternalLink } from "lucide-react";

interface Props {
  story: Story;
}

export default function StoryCard({ story }: Props) {
  const [open, setOpen] = useState(false);
  const scoreLabel =
    story.editorial_score === undefined || story.editorial_score === null
      ? null
      : Math.round(story.editorial_score > 1 ? story.editorial_score : story.editorial_score * 100);

  const topics = story.topics ?? [];
  const canExpand = topics.length > 0 || !!story.representative;

  return (
    <article className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {story.category && (
            <span className="rounded-full bg-[--color-surface-muted] px-2 py-0.5 text-[11px] font-medium text-[--color-ink-muted]">
              {story.category}
            </span>
          )}
          {story.topic_count !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[--color-ink-subtle]">
              <Layers className="h-3 w-3" />
              {story.topic_count} topics
            </span>
          )}
        </div>
        {scoreLabel !== null && (
          <div className="flex items-center gap-1 rounded-md bg-[--color-accent-soft] px-2 py-1 text-xs font-semibold text-[--color-accent-ink]">
            <Sparkles className="h-3 w-3" />
            {scoreLabel}
          </div>
        )}
      </div>

      <h3 className="font-serif text-xl leading-snug text-[--color-ink]">{story.title}</h3>

      {story.summary && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[--color-ink-muted]">
          {story.summary}
        </p>
      )}

      {story.keywords && story.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {story.keywords.slice(0, 6).map((k) => (
            <span
              key={k}
              className="rounded-md border border-[--color-border] px-1.5 py-0.5 text-[11px] text-[--color-ink-muted]"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {canExpand && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[--color-accent-ink] hover:underline"
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? "Hide topics" : "View related topics"}
        </button>
      )}

      {open && (
        <div className="mt-4 space-y-2 border-t border-[--color-border] pt-4">
          {story.representative && (
            <div className="rounded-lg bg-[--color-surface-muted] p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[--color-ink-subtle]">
                Representative
              </div>
              <a
                href={story.representative.source_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-2 text-sm font-medium text-[--color-ink] hover:text-[--color-accent-ink]"
              >
                <span>{story.representative.title}</span>
                <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
              </a>
              <div className="mt-0.5 text-xs text-[--color-ink-muted]">
                {story.representative.source}
              </div>
            </div>
          )}
          {topics.slice(0, 8).map((t, i) => (
            <a
              key={t.id ?? i}
              href={t.source_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-[--color-ink] hover:bg-[--color-surface-muted]"
            >
              <span className="min-w-0 flex-1 truncate">{t.title}</span>
              <span className="flex-shrink-0 text-xs text-[--color-ink-subtle]">{t.source}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
