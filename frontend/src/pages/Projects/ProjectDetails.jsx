import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject } from "../../services/projectService";
import Breadcrumb from "../../components/common/Breadcrumb";
import StatusBadge from "../../components/common/StatusBadge";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import PermitCard from "../../components/permits/PermitCard";
import EmptyState from "../../components/common/EmptyState";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getProject(id)
      .then(setProject)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loading label="Loading project..." />;
  if (error || !project) return <ErrorState onRetry={load} />;

  const zoning = project.property?.zoning ?? {};

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Breadcrumb items={[{ label: "Projects", to: "/projects" }, { label: project.name }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">{project.name}</h1>
          <p className="text-sm text-[var(--text-700)]">UPI: {project.upi}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <section className="rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-700)]">
          Property
        </h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[var(--text-700)]">Purpose</dt>
            <dd className="font-medium capitalize text-[var(--text-900)]">{project.purpose || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-700)]">Province</dt>
            <dd className="font-medium text-[var(--text-900)]">{zoning.province || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-700)]">District</dt>
            <dd className="font-medium text-[var(--text-900)]">{zoning.district || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-700)]">Sector</dt>
            <dd className="font-medium text-[var(--text-900)]">{zoning.sector || "—"}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Permits on this project</h2>
        {project.permits?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.permits.map((permit) => (
              <PermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        ) : (
          <EmptyState title="No permits yet" />
        )}
      </section>
    </div>
  );
}
