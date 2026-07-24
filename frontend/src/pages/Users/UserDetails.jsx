import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser, updateUser } from "../../services/userService";
import Breadcrumb from "../../components/common/Breadcrumb";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const load = () => {
    setLoading(true);
    setError(false);
    getUser(id)
      .then((data) => {
        setUser(data);
        setForm({ name: data.name || "", phone: data.phone || "" });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    const updated = await updateUser(id, form);
    setUser(updated);
    setEditing(false);
  };

  if (loading) return <Loading label="Loading user..." />;
  if (error || !user) return <ErrorState onRetry={load} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <Breadcrumb items={[{ label: "Users", to: "/users" }, { label: user.name }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">{user.name}</h1>
          <p className="text-sm capitalize text-[var(--text-700)]">{user.role?.replace(/_/g, " ")}</p>
        </div>
        <StatusBadge status={user.status || "active"} />
      </div>

      {!editing ? (
        <div className="space-y-2 rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
          <p className="text-sm text-[var(--text-900)]">Email: {user.email}</p>
          <p className="text-sm text-[var(--text-900)]">Phone: {user.phone || "—"}</p>
          {user.district && <p className="text-sm text-[var(--text-900)]">District: {user.district}</p>}
          <button
            onClick={() => setEditing(true)}
            className="mt-3 rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
          >
            Edit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
