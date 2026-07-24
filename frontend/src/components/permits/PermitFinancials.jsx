const formatCurrency = (value, currency = "RWF") =>
  value == null ? "—" : `${Number(value).toLocaleString()} ${currency}`;

export default function PermitFinancials({ financials }) {
  if (!financials) return null;

  const rows = [
    { label: "Estimated Cost", value: formatCurrency(financials.estimated_cost) },
    { label: "Permit Fee", value: formatCurrency(financials.permit_fee) },
    { label: "Amount Paid", value: formatCurrency(financials.amount_paid) },
    { label: "Payment Status", value: financials.payment_status || "—" },
  ];

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg border border-[var(--background-200)] p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-700)]">
            {row.label}
          </dt>
          <dd className="mt-1 font-medium capitalize text-[var(--text-900)]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
