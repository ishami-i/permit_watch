import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "./Loading";

export const ROLES = {
  CHIEF: "CHIEF_OMBUDSMAN",
  DEPUTY: "deputy_ombudsman",
  MONITORING_OFFICER: "monitoring_officer",
};

export const ADMIN_ROLES = [ROLES.CHIEF, ROLES.DEPUTY];

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
