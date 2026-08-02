import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/userService";
import { changePassword } from "../../services/authService";
import PermitTimeline from "../../components/permits/PermitTimeline";
import Modal from "../../components/common/Modal";

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  if (!user) return null;

  const closePasswordModal = () => {
    setChangingPassword(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSubmittingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "We couldn't update your password.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await updateUser(user.id, form);
      setEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.detail || "We couldn't save your changes.");
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
            <button
              onClick={() => setChangingPassword(true)}
              className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)] hover:bg-[var(--background-100)]"
            >
              Change password
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-5">
          {saveError && (
            <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-500)]">
              {saveError}
            </p>
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
              onClick={() => {
                setEditing(false);
                setSaveError(null);
              }}
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

      <Modal open={changingPassword} onClose={closePasswordModal} title="Change password">
        {passwordSuccess ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-900)]">Your password has been updated.</p>
            <button
              onClick={closePasswordModal}
              className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-500)]">
                {passwordError}
              </p>
            )}

            <div>
              <label className="mb-1 block text-sm text-[var(--text-700)]">Current password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                }
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[var(--text-700)]">New password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[var(--text-700)]">Confirm new password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                required
                autoComplete="new-password"
                className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-md border border-[var(--background-200)] px-4 py-2 text-sm text-[var(--text-700)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPassword}
                className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
              >
                {submittingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}