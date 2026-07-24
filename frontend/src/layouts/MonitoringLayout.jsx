import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import CompactSidebar from "../components/common/CompactSidebar";
import { useAuth } from "../context/AuthContext";

export default function MonitoringLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background-50)] text-[var(--text-900)]">
      <Header />

      <div className="flex flex-1">
        <CompactSidebar district={user?.district} />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
