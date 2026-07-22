import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-50)] text-[var(--text-900)]">
      <Header />

      <main className="flex-1">
        {/* Your pages */}
      </main>

      <Footer />
    </div>
  );
}

export default App;