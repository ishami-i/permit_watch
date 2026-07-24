export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--background-200)] py-16 text-center">
      <p className="font-medium text-[var(--text-900)]">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-[var(--text-700)]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
