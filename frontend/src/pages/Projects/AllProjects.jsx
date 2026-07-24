import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../../services/projectService";
import SearchBar from "../../components/common/SearchBar";
import FilterBar from "../../components/common/FilterBar";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "flagged", label: "Flagged" },
];

const PURPOSE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

export default function AllProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", purpose: "" });

  const load = () => {
    setLoading(true);
    setError(false);
    getProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !term || project.name?.toLowerCase().includes(term) || project.upi?.toLowerCase().includes(term);
      const matchesStatus = !filters.status || project.status === filters.status;
      const matchesPurpose = !filters.purpose || project.purpose === filters.purpose;
      return matchesSearch && matchesStatus && matchesPurpose;
    });
  }, [projects, search, filters]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Projects</h1>
        <p className="text-sm text-[var(--text-700)]">Construction projects tied to permits.</p>
      </div>

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by project name or UPI..." />
        <FilterBar
          filters={[
            { key: "status", label: "All Statuses", options: STATUS_OPTIONS },
            { key: "purpose", label: "All Purposes", options: PURPOSE_OPTIONS },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        />
      </div>

      {loading && <Loading label="Loading projects..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && !filtered.length && <EmptyState title="No projects found" />}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-[var(--text-900)]">{project.name}</p>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-1 text-xs text-[var(--text-700)]">{project.upi}</p>
              <p className="mt-2 text-sm capitalize text-[var(--text-700)]">{project.purpose}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
