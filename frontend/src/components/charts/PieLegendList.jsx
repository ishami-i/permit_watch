// A readable list-style legend for pie charts, used instead of the default
// recharts <Legend /> + on-slice labels, which overlap badly once a chart
// has more than a handful of slices (e.g. 30 districts) or is viewed on a
// narrow screen.
export default function PieLegendList({ items, maxHeight }) {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div
      className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 overflow-y-auto pr-1 sm:grid-cols-2"
      style={maxHeight ? { maxHeight } : undefined}
    >
      {items.map((item) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div
            key={item.name}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-[var(--background-100)]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate capitalize text-[var(--text-900)]">{item.name}</span>
            </span>
            <span className="shrink-0 text-[var(--text-700)]">
              {item.value}
              <span className="ml-1 text-xs">({percent}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
