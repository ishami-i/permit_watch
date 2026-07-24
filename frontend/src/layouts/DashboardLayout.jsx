import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background-50)] text-[var(--text-900)]">
      <Header />

      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
