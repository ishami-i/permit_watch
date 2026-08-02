import { useEffect, useMemo, useState } from "react";
import { getUsers, getRoles, updateUserRole } from "../../services/userService";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

function EditRoleForm({ user, roles, onSaved, onCancel }) {
  const [roleId, setRoleId] = useState(user.role_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleId) {
      setError("Please select a role.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUserRole(user.id, Number(roleId));
      onSaved(updated);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-500)]">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Role</label>
        {roles.length === 0 ? (
          <p className="rounded-md bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-500)]">
            No roles found. Run the backend migrations so the default roles are created,
            then reopen this dialog.
          </p>
        ) : (
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded-md border border-[var(--background-200)] bg-[var(--background-50)] px-3 py-2 text-sm text-[var(--text-900)]"
          >
            <option value="" disabled>
              Select a role...
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || roles.length === 0}
          className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save role"}
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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([getUsers(), getRoles()])
      .then(([userData, roleData]) => {
        setUsers(Array.isArray(userData) ? userData : []);
        setRoles(Array.isArray(roleData) ? roleData : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Users</h1>
        <p className="text-sm text-[var(--text-700)]">
          Everyone with access to Permit Watch, and the role they hold.
        </p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or role..." />

      {loading && <Loading label="Loading users..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
          <table className="min-w-full divide-y divide-[var(--background-200)] text-sm">
            <thead className="bg-[var(--background-100)] text-left text-xs uppercase tracking-wide text-[var(--text-700)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--background-200)] bg-[var(--background-50)]">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-[var(--text-900)]">
                    {u.name}
                    {u.is_superuser && (
                      <span className="ml-2 rounded-full bg-[var(--primary-100)] px-2 py-0.5 text-xs text-[var(--primary-700)]">
                        Superuser
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-700)]">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-[var(--text-700)]">
                    {u.role ? u.role.replace(/_/g, " ") : "— No role assigned —"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-700)]">{u.district || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="rounded-md border border-[var(--background-200)] px-3 py-1.5 text-sm text-[var(--text-700)] hover:bg-[var(--background-100)]"
                    >
                      Change role
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[var(--text-700)]">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Change role — ${editingUser?.name || ""}`}
      >
        {editingUser && (
          <EditRoleForm
            user={editingUser}
            roles={roles}
            onSaved={(updated) => {
              setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
              setEditingUser(null);
            }}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>
    </div>
  );
}