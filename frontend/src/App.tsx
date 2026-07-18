import { useCallback, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import Stories from "./pages/Stories";
import Topics from "./pages/Topics";
import History from "./pages/History";
import { useRefreshPipeline } from "./hooks/useRefreshPipeline";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Intelligence Dashboard",
    subtitle: "Real-time editorial intelligence and trend discovery",
  },
  "/opportunities": {
    title: "Opportunities",
    subtitle: "AI-generated editorial angles ranked by potential",
  },
  "/stories": {
    title: "Stories",
    subtitle: "Clustered narratives across your sources",
  },
  "/topics": {
    title: "Topics",
    subtitle: "Every semantically-unique topic in the latest snapshot",
  },
  "/history":{
    title:"History",
    subtitle:"",
  }
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const { pathname } = useLocation();

  const onComplete = useCallback(() => {
    setRefreshTick((n) => n + 1);
  }, []);

  const { status, refreshing, trigger } = useRefreshPipeline({ onComplete });

  const meta = pageMeta[pathname] ?? pageMeta["/"];

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          status={status}
          refreshing={refreshing}
          onRefresh={trigger}
          onOpenMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard status={status} refreshing={refreshing} refreshTick={refreshTick} />
              }
            />
            <Route path="/opportunities" element={<Opportunities refreshTick={refreshTick} />} />
            <Route path="/stories" element={<Stories refreshTick={refreshTick} />} />
            <Route path="/topics" element={<Topics refreshTick={refreshTick} />} />
            <Route path="/history" element={<History/>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
