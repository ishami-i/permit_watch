import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "./Loading";

export const ROLES = {
  CHIEF: "chief_ombudsman",
  CHIEF_ALT: "Chief_Ombudsman",
  DEPUTY: "deputy_ombudsman",
  MONITORING_OFFICER: "monitoring_officer",
  ADMIN: "admin",
};

export const ADMIN_ROLES = [ROLES.CHIEF, ROLES.DEPUTY, ROLES.CHIEF_ALT];
export const USERS_PAGE_ROLES = [...ADMIN_ROLES, ROLES.ADMIN];

export const normalizeRole = (role) => role?.toLowerCase();

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    allowedRoles &&
    !user.is_superuser &&
    !allowedRoles.map(normalizeRole).includes(normalizeRole(user.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
