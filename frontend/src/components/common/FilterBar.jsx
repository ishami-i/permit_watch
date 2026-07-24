// filters: [{ key, label, options: [{ value, label }] }]
export default function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={values[filter.key] ?? ""}
          onChange={(e) => onChange(filter.key, e.target.value)}
          className="rounded-md border border-[var(--background-200)] bg-[var(--background-50)] px-3 py-2 text-sm text-[var(--text-900)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
