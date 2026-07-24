import { useEffect, useMemo, useState } from "react";
import LocationFilters from "./LocationFilters";
import { permitData } from "../api/axios";

export default function Listing() {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState({
    province: "",
    district: "",
    sector: "",
  });

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    permitData()
      .then((data) => {
        if (!cancelled) setPermits(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load permits");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h2 className="text-lg font-semibold text-[var(--text-900)] mb-4">
        Permit Listings
      </h2>

      <div className="mb-4 space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permits..."
          className="w-full px-4 py-2 border border-[var(--background-200)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
        />

        <LocationFilters onChange={setLocation} />
      </div>

      {loading && (
        <p className="text-[var(--text-700)]">Loading permits...</p>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[var(--background-200)]">
            <thead>
              <tr className="bg-[var(--background-100)]">
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Permit ID</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Applicant</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Project</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">UPI</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Status</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Submission Date</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Resubmission</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Response Date</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Province</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">District</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Sector</th>
                <th className="border border-[var(--background-200)] px-4 py-2 text-left">Supervisor</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermits.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-center py-4 text-[var(--text-700)] border border-[var(--background-200)]"
                  >
                    No permits found.
                  </td>
                </tr>
              ) : (
                filteredPermits.map((permit) => {
                  const zoning = permit.project?.property?.zoning ?? {};
                  return (
                    <tr key={permit.id}>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.id}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.applicant?.name}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.project?.name}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.project?.upi}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.status}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.submission_date}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">
                        {permit.resubmission ? "Yes" : "No"}
                      </td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.response_date}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{zoning.province}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{zoning.district}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{zoning.sector}</td>
                      <td className="border border-[var(--background-200)] px-4 py-2">{permit.supervisor?.name}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}