import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "./Loading";

export const ROLES = {
  CHIEF: "chief_ombudsman",
  CHIEF_ALT: "Chief_Ombudsman",
  DEPUTY: "deputy_ombudsman",
  MONITORING_OFFICER: "monitoring_officer",
};

export const ADMIN_ROLES = [ROLES.CHIEF, ROLES.DEPUTY, ROLES.CHIEF_ALT];

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("DEBUG role check:", { userRole: user.role, allowedRoles });
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
