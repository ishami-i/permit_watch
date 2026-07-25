import { useEffect, useMemo, useState } from "react";
import { getUsers, deactivateUser } from "../../services/userService";
import SearchBar from "../../components/common/SearchBar";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge";

const GROUPS = [
  { role: "CHIEF_OMBUDSMAN", title: "Chief Ombudsman" },
  { role: "deputy_ombudsman", title: "Deputy Ombudsman" },
  { role: "monitoring_officer", title: "Monitoring Officers" },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(term));
  }, [users, search]);

  const handleDeactivate = async (userId) => {
    await deactivateUser(userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "inactive" } : u)));
  };

  if (loading) return <Loading label="Loading users..." />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Users</h1>
        <p className="text-sm text-[var(--text-700)]">
          Chief and Deputy Ombudsman share the same permissions.
        </p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />

      {GROUPS.map((group) => {
        const groupUsers = filtered.filter((u) => u.role === group.role);
        if (!groupUsers.length) return null;

        return (
          <section key={group.role}>
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">{group.title}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/users/${user.id}`}
                      className="font-medium text-[var(--text-900)] hover:text-[var(--primary-600)]"
                    >
                      {user.name}
                    </Link>
                    <StatusBadge status={user.status || "active"} />
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-700)]">{user.email}</p>
                  {user.district && <p className="text-xs text-[var(--text-700)]">{user.district}</p>}
                  {user.status !== "inactive" && (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="mt-3 text-xs font-medium text-[var(--danger-500)] hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
