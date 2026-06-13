import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Compass,
  Gauge,
  LayoutDashboard,
  MousePointerClick,
  Radio,
  Route,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: Boxes },
  { id: "users", label: "Users", icon: Users },
  { id: "pages", label: "Pages", icon: MousePointerClick },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "journey", label: "User Journey", icon: Route },
  { id: "sessions", label: "Sessions", icon: Timer },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "errors", label: "Errors", icon: AlertTriangle },
  { id: "realtime", label: "Real-Time", icon: Radio },
  { id: "executive", label: "Executive", icon: BarChart3 },
  { id: "insights", label: "AI Insights", icon: Sparkles },
];

export function DashboardSidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-card/60 backdrop-blur lg:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Telemetry</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="rounded-lg border bg-background/60 p-3">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium">SDK v1.0.0</p>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Streaming events to ClickHouse · all systems normal</p>
        </div>
      </div>
    </aside>
  );
}

export { sections as dashboardSections };
