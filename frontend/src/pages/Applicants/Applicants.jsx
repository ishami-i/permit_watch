import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApplicants } from "../../services/applicantService";
import SearchBar from "../../components/common/SearchBar";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    getApplicants()
      .then((data) => setApplicants(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return applicants;
    return applicants.filter(
      (applicant) =>
        applicant.name?.toLowerCase().includes(term) || applicant.phone?.includes(term)
    );
  }, [applicants, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Applicants</h1>
        <p className="text-sm text-[var(--text-700)]">Individuals and entities who have submitted permits.</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone..." />

      {loading && <Loading label="Loading applicants..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && !filtered.length && <EmptyState title="No applicants found" />}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Permits</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--background-200)]">
              {filtered.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-[var(--background-100)]">
                  <td className="px-4 py-2 font-medium text-[var(--text-900)]">{applicant.name}</td>
                  <td className="px-4 py-2">{applicant.phone}</td>
                  <td className="px-4 py-2">{applicant.email}</td>
                  <td className="px-4 py-2">{applicant.permit_count ?? 0}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/applicants/${applicant.id}`}
                      className="font-medium text-[var(--primary-600)] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
