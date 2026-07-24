import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-lg bg-[var(--background-50)] shadow-md"
      >
        <div className="flex items-center justify-between border-b border-[var(--background-200)] px-5 py-4">
          <h2 className="font-semibold text-[var(--text-900)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[var(--text-700)] hover:bg-[var(--background-100)]"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--background-200)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
