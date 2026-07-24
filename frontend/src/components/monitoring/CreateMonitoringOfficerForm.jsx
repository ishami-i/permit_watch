import { useState } from "react";
import locations from "../../data/locations.json";
import { createMonitoringOfficer } from "../../services/monitoringService";

const initialForm = { name: "", email: "", phone: "", province: "", district: "" };

export default function CreateMonitoringOfficerForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const districts = form.province ? Object.keys(locations[form.province]) : [];

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const officer = await createMonitoringOfficer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        district: form.district,
      });
      setForm(initialForm);
      onCreated?.(officer);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create monitoring officer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-lg bg-[var(--background-50)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--text-900)]">Create Monitoring Officer</h2>

      {error && <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-500)]">{error}</p>}

      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={update("name")}
          required
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={update("email")}
          required
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Phone</label>
        <input
          type="text"
          value={form.phone}
          onChange={update("phone")}
          required
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Province</label>
        <select
          value={form.province}
          onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value, district: "" }))}
          required
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
        >
          <option value="">Select Province</option>
          {Object.keys(locations).map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">District</label>
        <select
          value={form.district}
          onChange={update("district")}
          required
          disabled={!form.province}
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] disabled:opacity-50"
        >
          <option value="">Select District</option>
          {districts.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--primary-500)] py-2 font-medium text-white transition-colors hover:bg-[var(--primary-600)] disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create Monitoring Officer"}
      </button>
    </form>
  );
}
