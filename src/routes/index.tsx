import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar, dashboardSections } from "@/components/dashboard/Sidebar";
import { GlobalFilters } from "@/components/dashboard/Filters";
import {
  ApplicationsSection,
  ErrorsSection,
  ExecutiveSection,
  FeaturesSection,
  InsightsSection,
  JourneySection,
  OverviewSection,
  PagesSection,
  PerformanceSection,
  RealtimeSection,
  SessionsSection,
  UsersSection,
} from "@/components/dashboard/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telemetry · Enterprise Application Analytics" },
      { name: "description", content: "Internal application monitoring and user activity analytics across every enterprise module." },
      { property: "og:title", content: "Telemetry · Enterprise Application Analytics" },
      { property: "og:description", content: "Internal application monitoring and user activity analytics across every enterprise module." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [active, setActive] = useState("overview");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const section = dashboardSections.find((s) => s.id === active);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar active={active} onSelect={setActive} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card/60 px-4 backdrop-blur">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight">
              {section?.label ?? "Overview"}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              Real-time analytics across all enterprise applications
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium md:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(var(--success))] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(var(--success))]" />
              </span>
              Live · 284 online
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              AK
            </div>
          </div>
        </header>

        <GlobalFilters />

        <main className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
          {active === "overview" && <OverviewSection />}
          {active === "applications" && <ApplicationsSection />}
          {active === "users" && <UsersSection />}
          {active === "pages" && <PagesSection />}
          {active === "features" && <FeaturesSection />}
          {active === "journey" && <JourneySection />}
          {active === "sessions" && <SessionsSection />}
          {active === "performance" && <PerformanceSection />}
          {active === "errors" && <ErrorsSection />}
          {active === "realtime" && <RealtimeSection />}
          {active === "executive" && <ExecutiveSection />}
          {active === "insights" && <InsightsSection />}
        </main>
      </div>
    </div>
  );
}
