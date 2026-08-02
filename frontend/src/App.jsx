import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute, { ADMIN_ROLES } from "./components/common/ProtectedRoute";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RoleLayout from "./layouts/RoleLayout";
import ErrorLayout from "./layouts/ErrorLayout";

import Login from "./pages/Authentication/Login";
import ForgotPassword from "./pages/Authentication/ForgotPassword";

import Dashboard from "./pages/Dashboard/Dashboard";

import AllPermits from "./pages/Permits/AllPermits";
import PermitDetails from "./pages/Permits/PermitDetails";
import FlaggedPermits from "./pages/Permits/FlaggedPermits";
import PendingPermits from "./pages/Permits/PendingPermits";

import AllProjects from "./pages/Projects/AllProjects";
import ProjectDetails from "./pages/Projects/ProjectDetails";

import Applicants from "./pages/Applicants/Applicants";
import ApplicantDetails from "./pages/Applicants/ApplicantDetails";

import Alerts from "./pages/Alerts/Alerts";
import AlertDetails from "./pages/Alerts/AlertDetails";

import Statistics from "./pages/Statistics/Statistics";

import AssignedOfficers from "./pages/Monitoring/AssignedOfficers";
import UnassignedOfficers from "./pages/Monitoring/UnassignedOfficers";
import DistrictCoverage from "./pages/Monitoring/DistrictCoverage";
import OfficerProfile from "./pages/Monitoring/OfficerProfile";

import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";
import Users from "./pages/Users/Users";

import NotFound from "./pages/Errors/NotFound";
import Unauthorized from "./pages/Errors/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Shared routes: any authenticated user, layout picked by role */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/permits" element={<AllPermits />} />
            <Route path="/permits/flagged" element={<FlaggedPermits />} />
            <Route path="/permits/pending" element={<PendingPermits />} />
            <Route path="/permits/:id" element={<PermitDetails />} />

            <Route path="/projects" element={<AllProjects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />

            <Route path="/applicants" element={<Applicants />} />
            <Route path="/applicants/:id" element={<ApplicantDetails />} />

            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alerts/:id" element={<AlertDetails />} />

            <Route path="/statistics" element={<Statistics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Chief / Deputy Ombudsman only */}
        <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/monitoring/assigned" element={<AssignedOfficers />} />
            <Route path="/monitoring/unassigned" element={<UnassignedOfficers />} />
            <Route path="/monitoring/coverage" element={<DistrictCoverage />} />
            <Route path="/monitoring/officers/:id" element={<OfficerProfile />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<ErrorLayout />}>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;