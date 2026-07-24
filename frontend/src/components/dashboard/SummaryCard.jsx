export default function SummaryCard({ label, value, tone = "primary" }) {
  const TONES = {
    primary: "bg-[var(--primary-500)] text-white",
    neutral: "bg-[var(--background-50)] text-[var(--text-900)] border border-[var(--background-200)]",
    danger: "bg-[var(--danger-500)] text-white",
    success: "bg-[var(--success-500)] text-white",
  };

  return (
    <div className={`rounded-xl p-5 shadow-sm ${TONES[tone]}`}>
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
