import type { LucideIcon } from "lucide-react";
import { formatNumber } from "../lib/format";

interface Props {
  label: string;
  value: number | null | undefined;
  description?: string;
  icon: LucideIcon;
  accent?: boolean;
}

export default function StatCard({ label, value, description, icon: Icon, accent }: Props) {
  return (
    <div className="group rounded-xl border border-[--color-border] bg-[--color-surface] p-5 transition-colors hover:border-[--color-border-strong]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[--color-ink-muted]">
          {label}
        </span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent
              ? "bg-[--color-accent-soft] text-[--color-accent-ink]"
              : "bg-[--color-surface-muted] text-[--color-ink-muted]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mb-1 font-serif text-4xl leading-none text-[--color-ink]">
        {formatNumber(value ?? 0)}
      </div>
      {description && (
        <p className="mt-2 text-xs text-[--color-ink-subtle]">{description}</p>
      )}
    </div>
  );
}
