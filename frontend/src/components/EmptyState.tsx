import { Inbox } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
}

export default function EmptyState({ title = "Nothing here yet", description }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-[--color-border-strong] bg-[--color-surface] p-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[--color-surface-muted] text-[--color-ink-muted]">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[--color-ink]">{title}</h3>
      {description && (
        <p className="mx-auto max-w-md text-sm text-[--color-ink-muted]">{description}</p>
      )}
    </div>
  );
}
