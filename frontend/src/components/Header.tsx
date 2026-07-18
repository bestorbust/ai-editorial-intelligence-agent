import { Menu, RefreshCw, Clock, Loader2 } from "lucide-react";
import { formatRelative } from "../lib/format";
import type { StatusData } from "../types/api";

interface Props {
  title: string;
  subtitle: string;
  status: StatusData | null;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenMenu: () => void;
}

export default function Header({
  title,
  subtitle,
  status,
  refreshing,
  onRefresh,
  onOpenMenu,
}: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-[--color-border] bg-[--color-bg]/85 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-4 lg:px-8">
        <button
          onClick={onOpenMenu}
          className="rounded-md p-2 text-[--color-ink-muted] hover:bg-[--color-surface-muted] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl leading-tight text-[--color-ink] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-0.5 hidden text-sm text-[--color-ink-muted] sm:block">
            {subtitle}
          </p>
        </div>

        <div className="hidden items-center gap-1.5 text-xs text-[--color-ink-muted] md:flex">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated {formatRelative(status?.last_updated)}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg bg-[--color-ink] px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Refreshing…</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Get Latest Updates</span>
              <span className="sm:hidden">Update</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
