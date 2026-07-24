export default function ErrorState({
  title = "Something went wrong",
  description = "That request failed. Try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[var(--danger-500)]/30 bg-[var(--danger-bg)] py-16 text-center">
      <p className="font-medium text-[var(--danger-500)]">{title}</p>
      <p className="max-w-sm text-sm text-[var(--text-700)]">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
