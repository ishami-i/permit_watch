const TONES = {
  success: "text-[var(--success-500)] bg-[var(--success-bg)]",
  warning: "text-[var(--warning-500)] bg-[var(--warning-bg)]",
  danger: "text-[var(--danger-500)] bg-[var(--danger-bg)]",
  info: "text-[var(--info-500)] bg-[var(--info-bg)]",
  neutral: "text-[var(--text-700)] bg-[var(--background-100)]",
};

// Maps common status/severity strings to a tone; falls back to neutral.
const STATUS_TONE_MAP = {
  approved: "success",
  covered: "success",
  resolved: "success",
  low: "success",
  pending: "warning",
  under_review: "warning",
  investigating: "warning",
  medium: "warning",
  needs_assignment: "warning",
  flagged: "danger",
  rejected: "danger",
  dismissed: "neutral",   
  high: "danger",
  critical: "danger",
};

export default function StatusBadge({ status, tone }) {
  const resolvedTone =
    tone || STATUS_TONE_MAP[String(status).toLowerCase().replace(/\s+/g, "_")] || "neutral";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TONES[resolvedTone]}`}
    >
      {String(status).replace(/_/g, " ")}
    </span>
  );
}
