import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAlert, updateAlertStatus } from "../../services/alertService";
import Breadcrumb from "../../components/common/Breadcrumb";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import PermitTimeline from "../../components/permits/PermitTimeline";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

export default function AlertDetails() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [note, setNote] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getAlert(id)
      .then((data) => {
        setAlert(data);
        setTargetStatus(data.status);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await updateAlertStatus(id, targetStatus, note);
      setAlert(updated);
      setNote("");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading label="Loading alert..." />;
  if (error || !alert) return <ErrorState onRetry={load} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <Breadcrumb items={[{ label: "Alerts", to: "/alerts" }, { label: `Alert #${alert.id}` }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">{alert.reason}</h1>
          <p className="text-sm text-[var(--text-700)]">{alert.district}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={alert.severity} />
          <StatusBadge status={alert.status} />
        </div>
      </div>

      {alert.permit_id && (
        <Link
          to={`/permits/${alert.permit_id}`}
          className="inline-block text-sm font-medium text-[var(--primary-600)] hover:underline"
        >
          View related permit →
        </Link>
      )}

      <section className="rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-700)]">Evidence</h2>
        <p className="text-sm text-[var(--text-900)]">{alert.evidence || "No evidence attached."}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Timeline</h2>
        <PermitTimeline events={alert.timeline || []} />
      </section>

      <section className="rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-700)]">
          Comments &amp; Status
        </h2>

        <ul className="mb-4 space-y-3">
          {(alert.comments || []).map((comment) => (
            <li key={comment.id} className="rounded-md bg-[var(--background-100)] p-3 text-sm">
              <p className="font-medium text-[var(--text-900)]">{comment.author}</p>
              <p className="text-[var(--text-700)]">{comment.text}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-[var(--text-700)]">Status</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full max-w-xs rounded-md border border-[var(--background-200)] px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional — not yet saved, see below)..."
            rows={3}
            className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
          />

          <button
            type="submit"
            disabled={updating || (targetStatus === alert.status && !note)}
            className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
          >
            {updating ? "Updating..." : "Update Status"}
          </button>
        </form>
      </section>
    </div>
  );
}