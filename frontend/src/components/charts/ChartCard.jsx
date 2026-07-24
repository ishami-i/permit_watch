export default function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-[var(--background-200)] bg-[var(--background-50)] p-6 shadow-sm">
      <h3 className="mb-4 text-center text-sm font-semibold text-[var(--text-900)]">{title}</h3>
      {children}
    </div>
  );
}
