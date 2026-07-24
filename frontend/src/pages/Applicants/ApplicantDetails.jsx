import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicant } from "../../services/applicantService";
import Breadcrumb from "../../components/common/Breadcrumb";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PermitCard from "../../components/permits/PermitCard";
import PermitTimeline from "../../components/permits/PermitTimeline";

export default function ApplicantDetails() {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getApplicant(id)
      .then(setApplicant)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loading label="Loading applicant..." />;
  if (error || !applicant) return <ErrorState onRetry={load} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Breadcrumb items={[{ label: "Applicants", to: "/applicants" }, { label: applicant.name }]} />

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">{applicant.name}</h1>
        <p className="text-sm text-[var(--text-700)]">
          {applicant.phone} {applicant.email && `· ${applicant.email}`}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Permits</h2>
        {applicant.permits?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {applicant.permits.map((permit) => (
              <PermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        ) : (
          <EmptyState title="No permits filed yet" />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">History</h2>
        <PermitTimeline events={applicant.history || []} />
      </section>
    </div>
  );
}
