import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/userService";
import PermitTimeline from "../../components/permits/PermitTimeline";

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.id, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-100)] text-xl font-bold text-[var(--primary-700)]">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-900)]">{user.name}</h1>
          <p className="text-sm capitalize text-[var(--text-700)]">{user.role?.replace(/_/g, " ")}</p>
        </div>
      </div>

      {!editing ? (
        <div className="space-y-2 rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
          <p className="text-sm text-[var(--text-900)]">Email: {user.email}</p>
          <p className="text-sm text-[var(--text-900)]">Phone: {user.phone || "—"}</p>
          {user.district && <p className="text-sm text-[var(--text-900)]">District: {user.district}</p>}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
            >
              Edit profile
            </button>
            <button className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)]">
              Change password
            </button>
          </div>
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
              disabled={saving}
              className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
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

      {user.activity && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Recent Activity</h2>
          <PermitTimeline events={user.activity} />
        </section>
      )}
    </div>
  );
}
