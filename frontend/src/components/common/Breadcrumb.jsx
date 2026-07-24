import { Link } from "react-router-dom";

// items: [{ label, to }] — last item renders as plain text (current page)
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--text-700)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.to ? (
                <span className="font-medium text-[var(--text-900)]">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-[var(--primary-500)]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
