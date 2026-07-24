import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAlert, resolveAlert } from "../../services/alertService";
import Breadcrumb from "../../components/common/Breadcrumb";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import PermitTimeline from "../../components/permits/PermitTimeline";

export default function AlertDetails() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [note, setNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getAlert(id)
      .then(setAlert)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleResolve = async (e) => {
    e.preventDefault();
    setResolving(true);
    try {
      const updated = await resolveAlert(id, note);
      setAlert(updated);
      setNote("");
    } finally {
      setResolving(false);
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
          Comments &amp; Resolution
        </h2>

        <ul className="mb-4 space-y-3">
          {(alert.comments || []).map((comment) => (
            <li key={comment.id} className="rounded-md bg-[var(--background-100)] p-3 text-sm">
              <p className="font-medium text-[var(--text-900)]">{comment.author}</p>
              <p className="text-[var(--text-700)]">{comment.text}</p>
            </li>
          ))}
        </ul>

        {alert.status !== "resolved" && (
          <form onSubmit={handleResolve} className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a resolution note..."
              required
              rows={3}
              className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
            />
            <button
              type="submit"
              disabled={resolving}
              className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
            >
              {resolving ? "Resolving..." : "Mark as Resolved"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
