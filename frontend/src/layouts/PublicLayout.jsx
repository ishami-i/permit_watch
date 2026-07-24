import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

// Reserved for future public-facing pages (landing, about, help).
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background-50)] text-[var(--text-900)]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
