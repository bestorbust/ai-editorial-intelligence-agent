import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[--color-danger]">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[--color-ink]">
        Unable to connect to the Intelligence API
      </h3>
      <p className="mx-auto max-w-md text-sm text-[--color-ink-muted]">
        {message || "The backend is temporarily unreachable. Cached data cannot be loaded right now."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[--color-border-strong] bg-[--color-surface] px-3 py-1.5 text-sm font-medium text-[--color-ink] hover:bg-[--color-surface-muted]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
