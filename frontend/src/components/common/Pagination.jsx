export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[var(--background-200)] pt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md px-3 py-1.5 text-sm text-[var(--text-900)] hover:bg-[var(--background-100)] disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-sm text-[var(--text-700)]">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md px-3 py-1.5 text-sm text-[var(--text-900)] hover:bg-[var(--background-100)] disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
