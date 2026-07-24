import { useEffect, useState } from "react";
import { getUnassignedOfficers, assignOfficer } from "../../services/monitoringService";
import OfficerCard from "../../components/monitoring/OfficerCard";
import CreateMonitoringOfficerForm from "../../components/monitoring/CreateMonitoringOfficerForm";
import Modal from "../../components/common/Modal";
import LocationFilters from "../../components/common/LocationFilters";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";

export default function UnassignedOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [assignDistrict, setAssignDistrict] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    getUnassignedOfficers()
      .then((data) => setOfficers(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAssignSubmit = async () => {
    if (!assigning || !assignDistrict) return;
    await assignOfficer(assigning.id, assignDistrict);
    setOfficers((prev) => prev.filter((o) => o.id !== assigning.id));
    setAssigning(null);
    setAssignDistrict("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">Unassigned Officers</h1>
          <p className="text-sm text-[var(--text-700)]">Officers awaiting a district assignment.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          + New Officer
        </button>
      </div>

      {loading && <Loading label="Loading officers..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && !officers.length && <EmptyState title="No unassigned officers" />}
      {!loading && !error && officers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {officers.map((officer) => (
            <OfficerCard key={officer.id} officer={officer} onAssign={setAssigning} />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Monitoring Officer">
        <CreateMonitoringOfficerForm
          onCreated={() => {
            setCreateOpen(false);
            load();
          }}
        />
      </Modal>

      <Modal
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title={`Assign ${assigning?.name || ""}`}
        footer={
          <>
            <button
              onClick={() => setAssigning(null)}
              className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)]"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              disabled={!assignDistrict}
              className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
            >
              Confirm Assignment
            </button>
          </>
        }
      >
        <LocationFilters onChange={({ district }) => setAssignDistrict(district)} />
      </Modal>
    </div>
  );
}
