interface Props {
  rows?: number;
  variant?: "cards" | "list" | "stats";
}

export default function LoadingState({ rows = 6, variant = "cards" }: Props) {
  if (variant === "stats") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
            <div className="skeleton mb-4 h-4 w-24" />
            <div className="skeleton mb-2 h-8 w-20" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === "list") {
    return (
      <div className="divide-y divide-[--color-border] rounded-xl border border-[--color-border] bg-[--color-surface]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
          <div className="skeleton mb-3 h-5 w-3/4" />
          <div className="skeleton mb-2 h-3 w-full" />
          <div className="skeleton mb-4 h-3 w-5/6" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-16" />
            <div className="skeleton h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
