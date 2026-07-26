import { useEffect, useMemo, useState } from "react";
import {
  getAssignedOfficers,
  updateOfficer,
  unassignOfficer,
  createMonitoringOfficer,
} from "../../services/monitoringService";
import SearchBar from "../../components/common/SearchBar";
import OfficerTable from "../../components/monitoring/OfficerTable";
import CreateMonitoringOfficerForm from "../../components/monitoring/CreateMonitoringOfficerForm";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

function EditOfficerForm({ officer, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: officer.name || "",
    phone: officer.phone || "",
    email: officer.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateOfficer(officer.id, form);
      onSaved(updated);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update officer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-500)]">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Phone</label>
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AssignedOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [unassigning, setUnassigning] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    getAssignedOfficers()
      .then((data) => setOfficers(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return officers;
    return officers.filter(
      (o) => o.name?.toLowerCase().includes(term) || o.district?.toLowerCase().includes(term)
    );
  }, [officers, search]);

  const handleUnassignConfirm = async () => {
    if (!unassigning) return;
    await unassignOfficer(unassigning.id);
    setOfficers((prev) => prev.filter((o) => o.id !== unassigning.id));
    setUnassigning(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">Assigned Officers</h1>
          <p className="text-sm text-[var(--text-700)]">Monitoring officers currently assigned to a district.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          + New Officer
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or district..." />

      {loading && <Loading label="Loading officers..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && (
        <OfficerTable
          officers={filtered}
          onEdit={setEditingOfficer}
          onUnassign={setUnassigning}
        />
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
        open={!!editingOfficer}
        onClose={() => setEditingOfficer(null)}
        title={`Edit ${editingOfficer?.name || ""}`}
      >
        {editingOfficer && (
          <EditOfficerForm
            officer={editingOfficer}
            onSaved={(updated) => {
              setOfficers((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
              setEditingOfficer(null);
            }}
            onCancel={() => setEditingOfficer(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!unassigning}
        onClose={() => setUnassigning(null)}
        title="Unassign officer"
        footer={
          <>
            <button
              onClick={() => setUnassigning(null)}
              className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)]"
            >
              Cancel
            </button>
            <button
              onClick={handleUnassignConfirm}
              className="rounded-md bg-[var(--danger-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--danger-500)]/90"
            >
              Confirm Unassign
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-700)]">
          {unassigning?.name} will be moved back to Unassigned Officers and removed from{" "}
          {unassigning?.district}.
        </p>
      </Modal>
    </div>
  );
}