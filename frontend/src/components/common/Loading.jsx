export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center gap-3 text-[var(--text-700)]">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary-300)] border-t-[var(--primary-600)]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
