import { useAuth } from "../context/AuthContext";
import DashboardLayout from "./DashboardLayout";
import MonitoringLayout from "./MonitoringLayout";
import { ROLES, normalizeRole } from "../components/common/ProtectedRoute";

// Chief and Deputy Ombudsman share the full DashboardLayout;
// Monitoring Officers get the simplified MonitoringLayout.
export default function RoleLayout() {
  const { user } = useAuth();

  if (normalizeRole(user?.role) === normalizeRole(ROLES.MONITORING_OFFICER)) {
    return <MonitoringLayout />;
  }

  return <DashboardLayout />;
}
