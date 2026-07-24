import { useEffect, useMemo, useState } from "react";
import SearchBar from "../common/SearchBar";
import LocationFilters from "../common/LocationFilters";
import PermitTable from "../permits/PermitTable";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import ErrorState from "../common/ErrorState";

const PAGE_SIZE = 10;

export default function PermitListPage({ title, description, fetcher }) {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState({ province: "", district: "", sector: "" });
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    fetcher()
      .then((data) => setPermits(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [fetcher]);

  const filteredPermits = useMemo(() => {
    const term = search.trim().toLowerCase();

    return permits.filter((permit) => {
      const zoning = permit.project?.property?.zoning ?? {};

      const matchesSearch =
        !term ||
        permit.applicant?.name?.toLowerCase().includes(term) ||
        permit.project?.name?.toLowerCase().includes(term) ||
        permit.project?.upi?.toLowerCase().includes(term);

      const matchesLocation =
        (!location.province || zoning.province === location.province) &&
        (!location.district || zoning.district === location.district) &&
        (!location.sector || zoning.sector === location.sector);

      return matchesSearch && matchesLocation;
    });
  }, [permits, search, location]);

  const totalPages = Math.max(1, Math.ceil(filteredPermits.length / PAGE_SIZE));
  const pagePermits = filteredPermits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, location]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">{title}</h1>
        {description && <p className="text-sm text-[var(--text-700)]">{description}</p>}
      </div>

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by applicant, project, or UPI..." />
        <LocationFilters onChange={setLocation} />
      </div>

      {loading && <Loading label="Loading permits..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && (
        <>
          <PermitTable permits={pagePermits} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
