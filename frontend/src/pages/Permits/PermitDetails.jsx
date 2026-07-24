import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFullPermit } from "../../services/permitService";
import Breadcrumb from "../../components/common/Breadcrumb";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import PermitProfessionals from "../../components/permits/PermitProfessionals";
import PermitFinancials from "../../components/permits/PermitFinancials";
import PermitTimeline from "../../components/permits/PermitTimeline";
import AlertTable from "../../components/alerts/AlertTable";

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-700)]">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-700)]">{label}</dt>
      <dd className="font-medium text-[var(--text-900)]">{value ?? "—"}</dd>
    </div>
  );
}

export default function PermitDetails() {
  const { id } = useParams();
  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getFullPermit(id)
      .then(setPermit)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loading label="Loading permit..." />;
  if (error || !permit) return <ErrorState onRetry={load} />;

  const zoning = permit.project?.property?.zoning ?? {};

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Permits", to: "/permits" },
          { label: permit.project?.name || `Permit #${permit.id}` },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">
            {permit.project?.name || `Permit #${permit.id}`}
          </h1>
          <p className="text-sm text-[var(--text-700)]">UPI: {permit.project?.upi || "—"}</p>
        </div>
        <StatusBadge status={permit.status} />
      </div>

      <Section title="Permit Information">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label="Submission Date" value={permit.submission_date} />
          <InfoRow label="Response Date" value={permit.response_date} />
          <InfoRow label="Resubmission" value={permit.resubmission ? "Yes" : "No"} />
        </dl>
      </Section>

      <Section title="Applicant">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label="Name" value={permit.applicant?.name} />
          <InfoRow label="Phone" value={permit.applicant?.phone} />
          <InfoRow label="Email" value={permit.applicant?.email} />
        </dl>
        {permit.applicant?.id && (
          <Link
            to={`/applicants/${permit.applicant.id}`}
            className="mt-3 inline-block text-sm font-medium text-[var(--primary-600)] hover:underline"
          >
            View applicant profile →
          </Link>
        )}
      </Section>

      <Section title="Project & Property">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label="Project" value={permit.project?.name} />
          <InfoRow label="Purpose" value={permit.project?.purpose} />
          <InfoRow label="Province" value={zoning.province} />
          <InfoRow label="District" value={zoning.district} />
          <InfoRow label="Sector" value={zoning.sector} />
        </dl>
        {permit.project?.id && (
          <Link
            to={`/projects/${permit.project.id}`}
            className="mt-3 inline-block text-sm font-medium text-[var(--primary-600)] hover:underline"
          >
            View project details →
          </Link>
        )}
      </Section>

      <Section title="Financial Information">
        <PermitFinancials financials={permit.financials} />
      </Section>

      <Section title="Professionals">
        <PermitProfessionals permit={permit} />
      </Section>

      <Section title="Alerts">
        <AlertTable alerts={permit.alerts || []} />
      </Section>

      <Section title="History">
        <PermitTimeline events={permit.history || []} />
      </Section>
    </div>
  );
}
