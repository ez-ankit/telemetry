import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Gauge,
  Globe2,
  HeartPulse,
  Layers,
  MousePointerClick,
  Radio,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Panel } from "./Panel";
import { KpiCard } from "./KpiCard";
import { CHART_COLORS, axisTickStyle, tooltipStyle } from "./charts";
import {
  activeUsersTimeline,
  aiInsights,
  apiResponseTrend,
  crossAppMovement,
  entryPages,
  errorTrend,
  exitPages,
  featureTrend,
  featuresUsage,
  leastApps,
  liveActivity,
  mostActiveDepts,
  mostActiveUsers,
  navFlow,
  pageVisitTrends,
  sessionDuration,
  slowestApps,
  slowestPages,
  topApps,
  topErrors,
  topPages,
  trafficDistribution,
  usageTrend,
  userGrowth,
  webVitals,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function OverviewSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active Users" value="12,438" delta={8.2} icon={Users} accent="primary" />
        <KpiCard label="Total Sessions" value="48,219" delta={4.6} icon={Activity} accent="info" />
        <KpiCard label="Total Page Views" value="312,884" delta={11.4} icon={Eye} accent="info" />
        <KpiCard label="Avg Session" value="6m 24s" delta={-2.1} icon={Clock} accent="warning" />
        <KpiCard label="Error Rate" value="0.42%" delta={-12.3} invertDelta icon={AlertOctagon} accent="destructive" />
        <KpiCard label="Health Score" value="94 / 100" delta={1.8} icon={HeartPulse} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Application Usage Trend" subtitle="Sessions, users and page views over time" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={usageTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="sessions" stroke={CHART_COLORS[0]} fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="users" stroke={CHART_COLORS[1]} fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Traffic Distribution" subtitle="Sessions by application">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie data={trafficDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {trafficDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 10, color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Top Applications" subtitle="By total sessions">
          <RankedList items={topApps.map((a) => ({ label: a.name, value: a.value }))} />
        </Panel>
        <Panel title="Least Used Applications" subtitle="Candidates for review or sunset">
          <RankedList items={leastApps.map((a) => ({ label: a.name, value: a.value }))} tone="warning" />
        </Panel>
      </div>

      <AIInsightsBlock />
    </>
  );
}

function RankedList({
  items,
  tone = "primary",
}: {
  items: { label: string; value: number }[];
  tone?: "primary" | "warning";
}) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((i, idx) => (
        <div key={i.label}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                {idx + 1}
              </span>
              <span className="font-medium text-foreground">{i.label}</span>
            </div>
            <span className="tabular-nums text-muted-foreground">{i.value.toLocaleString()}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                tone === "warning" ? "bg-[oklch(var(--warning))]" : "bg-primary",
              )}
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApplicationsSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Applications Live" value="8" icon={Layers} accent="primary" />
        <KpiCard label="Avg Adoption" value="62%" delta={3.4} icon={TrendingUp} accent="success" />
        <KpiCard label="Weekly Active Apps" value="7 / 8" icon={Activity} accent="info" />
        <KpiCard label="At-Risk Modules" value="2" delta={-1} invertDelta icon={AlertTriangle} accent="warning" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Application Usage Trend" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="sessions" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pageViews" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="users" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Traffic Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trafficDistribution} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
              <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {trafficDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Top Applications">
          <RankedList items={topApps.map((a) => ({ label: a.name, value: a.value }))} />
        </Panel>
        <Panel title="Least Used Applications">
          <RankedList items={leastApps.map((a) => ({ label: a.name, value: a.value }))} tone="warning" />
        </Panel>
      </div>
    </>
  );
}

export function UsersSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="MAU" value="12,438" delta={9.1} icon={Users} accent="primary" />
        <KpiCard label="WAU" value="6,221" delta={4.2} icon={Users} accent="info" />
        <KpiCard label="DAU" value="2,884" delta={1.6} icon={Users} accent="success" />
        <KpiCard label="New Users (30d)" value="412" delta={18.4} icon={TrendingUp} accent="success" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Active Users Timeline" subtitle="Last 24 hours" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activeUsersTimeline}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="hour" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="active" stroke={CHART_COLORS[0]} fill="url(#ag1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="User Growth" subtitle="New vs returning, monthly">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="new" stackId="a" fill={CHART_COLORS[2]} radius={[0, 0, 0, 0]} />
              <Bar dataKey="returning" stackId="a" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Most Active Users">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-2 py-2 text-left font-medium">User</th>
                <th className="px-2 py-2 text-right font-medium">Sessions</th>
                <th className="px-2 py-2 text-right font-medium">Events</th>
              </tr>
            </thead>
            <tbody>
              {mostActiveUsers.map((u) => (
                <tr key={u.user} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="px-2 py-2 font-medium text-foreground">{u.user}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{u.sessions}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{u.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Most Active Departments">
          <RankedList items={mostActiveDepts.map((d) => ({ label: d.dept, value: d.users }))} />
        </Panel>
      </div>
    </>
  );
}

export function PagesSection() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Most Visited Pages" className="xl:col-span-2">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-2 py-2 text-left font-medium">Path</th>
                <th className="px-2 py-2 text-right font-medium">Views</th>
                <th className="px-2 py-2 text-right font-medium">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.path} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="px-2 py-2 font-mono text-xs text-foreground">{p.path}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{p.views.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{p.avgTime}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Page Visit Trends" subtitle="By section, last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={pageVisitTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="dashboard" stroke={CHART_COLORS[0]} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="vehicles" stroke={CHART_COLORS[1]} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="bookings" stroke={CHART_COLORS[2]} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="projects" stroke={CHART_COLORS[3]} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Entry Pages" subtitle="Where sessions begin">
          <RankedList items={entryPages.map((p) => ({ label: p.path, value: p.entries }))} />
        </Panel>
        <Panel title="Exit Pages" subtitle="Where sessions end">
          <RankedList items={exitPages.map((p) => ({ label: p.path, value: p.exits }))} tone="warning" />
        </Panel>
      </div>
    </>
  );
}

export function FeaturesSection() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Most Used Features" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featuresUsage} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
              <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={axisTickStyle} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="uses" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Feature Adoption Rate" subtitle="% of users who used the feature">
          <div className="space-y-3">
            {featuresUsage.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{f.feature}</span>
                  <span className="tabular-nums text-muted-foreground">{f.adoption}%</span>
                </div>
                <Progress value={f.adoption} className="mt-1.5 h-1.5" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Feature Usage Trends" subtitle="Weekly events">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={featureTrend}>
            <defs>
              {[0, 1, 2].map((i) => (
                <linearGradient key={i} id={`ft${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
            <XAxis dataKey="week" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="export" stroke={CHART_COLORS[0]} fill="url(#ft0)" strokeWidth={2} />
            <Area type="monotone" dataKey="approve" stroke={CHART_COLORS[1]} fill="url(#ft1)" strokeWidth={2} />
            <Area type="monotone" dataKey="ai" stroke={CHART_COLORS[2]} fill="url(#ft2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </>
  );
}

export function JourneySection() {
  return (
    <>
      <Panel title="Navigation Flow" subtitle="How users move between key surfaces">
        <div className="space-y-2">
          {navFlow.map((f) => (
            <div key={`${f.from}-${f.to}`} className="flex items-center gap-3 rounded-lg border bg-background/40 p-3">
              <Badge variant="secondary" className="font-mono text-[10px]">{f.from}</Badge>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/60 to-primary/10" />
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <div className="h-px flex-1 bg-gradient-to-l from-primary/60 to-primary/10" />
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">{f.to}</Badge>
              <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">{f.value.toLocaleString()} ▶</span>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Cross Application Movement" subtitle="Top transitions between apps">
          <RankedList items={crossAppMovement.map((c) => ({ label: c.app, value: c.users }))} />
        </Panel>
        <Panel title="Session Path Visualization" subtitle="Sample of recent sessions">
          <div className="space-y-3 text-xs">
            {[
              ["Login", "Dashboard", "Heavy Vehicle Mgmt", "Reports", "Export CSV"],
              ["Login", "Dashboard", "Flight Booking", "Bookings/New", "Approve"],
              ["Login", "Admin Portal", "HR Suite", "Employees", "Edit"],
              ["Login", "Project Cost Mgmt", "Reports", "Export PDF"],
            ].map((path, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground">session #{1000 + idx}</span>
                {path.map((step, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="rounded-md border bg-card px-2 py-0.5 font-mono">{step}</span>
                    {i < path.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function SessionsSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Avg Session" value="6m 24s" delta={2.4} icon={Clock} accent="primary" />
        <KpiCard label="Bounce Rate" value="22.6%" delta={-1.8} invertDelta icon={TrendingDown} accent="success" />
        <KpiCard label="Engagement" value="74%" delta={3.1} icon={TrendingUp} accent="success" />
        <KpiCard label="Pages / Session" value="6.4" delta={0.4} icon={Eye} accent="info" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Session Duration Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sessionDuration}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="bucket" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {sessionDuration.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="User Engagement Metrics">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={[
              { metric: "Depth", value: 78 },
              { metric: "Time", value: 64 },
              { metric: "Recency", value: 82 },
              { metric: "Frequency", value: 71 },
              { metric: "Features", value: 59 },
              { metric: "Retention", value: 86 },
            ]}>
              <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
              <PolarAngleAxis dataKey="metric" tick={axisTickStyle} />
              <Radar dataKey="value" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.4} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </>
  );
}

export function PerformanceSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {webVitals.map((v) => {
          const ratio = v.value / v.target;
          const tone = ratio < 0.75 ? "success" : ratio < 1 ? "warning" : "destructive";
          return (
            <KpiCard
              key={v.metric}
              label={v.metric}
              value={`${v.value}${v.unit}`}
              icon={tone === "success" ? CheckCircle2 : AlertTriangle}
              accent={tone}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="API Response Time Trends" subtitle="P50 / P95 / P99, last 24h" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={apiResponseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="hour" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="p50" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p99" stroke={CHART_COLORS[6]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Slowest Applications">
          <div className="space-y-3">
            {slowestApps.map((a) => (
              <div key={a.app} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{a.app}</span>
                <Badge variant={a.loadMs > 2000 ? "destructive" : "secondary"} className="tabular-nums">
                  {(a.loadMs / 1000).toFixed(2)}s
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Slowest Pages">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="px-2 py-2 text-left font-medium">Path</th>
              <th className="px-2 py-2 text-right font-medium">Load Time</th>
              <th className="px-2 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {slowestPages.map((p) => (
              <tr key={p.path} className="border-b last:border-0 hover:bg-accent/40">
                <td className="px-2 py-2 font-mono text-xs">{p.path}</td>
                <td className="px-2 py-2 text-right tabular-nums">{(p.loadMs / 1000).toFixed(2)}s</td>
                <td className="px-2 py-2 text-right">
                  <Badge variant={p.loadMs > 2200 ? "destructive" : p.loadMs > 1500 ? "secondary" : "outline"}>
                    {p.loadMs > 2200 ? "Critical" : p.loadMs > 1500 ? "Slow" : "OK"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

export function ErrorsSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="JS Errors (24h)" value="1,247" delta={-8.2} invertDelta icon={AlertOctagon} accent="destructive" />
        <KpiCard label="API Failures" value="412" delta={4.6} icon={Zap} accent="warning" />
        <KpiCard label="Error Rate" value="0.42%" delta={-12.3} invertDelta icon={AlertTriangle} accent="success" />
        <KpiCard label="Impacted Users" value="89" delta={-3.1} invertDelta icon={Users} accent="warning" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Error Trends" subtitle="JS vs API errors, last 14 days" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={errorTrend}>
              <defs>
                <linearGradient id="er1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="er2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[3]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS[3]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="js" stroke="#ef4444" fill="url(#er1)" strokeWidth={2} />
              <Area type="monotone" dataKey="api" stroke={CHART_COLORS[3]} fill="url(#er2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Top Error Categories">
          <div className="space-y-2.5">
            {topErrors.map((e) => (
              <div key={e.type} className="rounded-lg border bg-background/40 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">{e.type}</p>
                  <Badge
                    variant={e.severity === "high" ? "destructive" : "secondary"}
                    className="shrink-0 text-[10px]"
                  >
                    {e.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">{e.count} occurrences</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function RealtimeSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Users Online" value="284" icon={Radio} accent="success" />
        <KpiCard label="Active Apps" value="6 / 8" icon={Activity} accent="primary" />
        <KpiCard label="Events / min" value="1,842" icon={Zap} accent="info" />
        <KpiCard label="Live Sessions" value="312" icon={Globe2} accent="info" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Live Activity Feed"
          subtitle="Streaming from ClickHouse"
          actions={<span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[oklch(var(--success))]"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(var(--success))] opacity-60"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(var(--success))]"></span></span>Live</span>}
        >
          <ul className="space-y-2">
            {liveActivity.map((e, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-lg border bg-background/40 p-2.5 text-xs">
                <div className={cn(
                  "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  e.action === "errored" ? "bg-destructive" : "bg-primary",
                )} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground">
                    <span className="font-medium">{e.user}</span>{" "}
                    <span className="text-muted-foreground">{e.action}</span>{" "}
                    <span className="font-mono">{e.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{e.app}</p>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{e.t} ago</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Live Events Stream" subtitle="Per-application activity, now">
          <div className="space-y-3">
            {topApps.map((a, i) => (
              <div key={a.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{a.name}</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(50 + i * 17 + Math.random() * 20)} ev/min</span>
                </div>
                <div className="mt-1.5 h-8 overflow-hidden rounded-md bg-muted">
                  <div className="flex h-full items-end gap-[2px] px-1 py-1">
                    {Array.from({ length: 40 }).map((_, k) => (
                      <div
                        key={k}
                        className="w-1 rounded-sm bg-primary/70"
                        style={{ height: `${20 + Math.abs(Math.sin(i * 9 + k)) * 80}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function ExecutiveSection() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Adoption Rate" value="72%" delta={4.1} icon={TrendingUp} accent="success" />
        <KpiCard label="Monthly Active Users" value="12,438" delta={9.1} icon={Users} accent="primary" />
        <KpiCard label="Most Valuable App" value="Project Cost" icon={Sparkles} accent="info" />
        <KpiCard label="Least Utilized" value="Light Vehicle" icon={TrendingDown} accent="warning" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Application Health Matrix" subtitle="Multi-dimensional health per app">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { metric: "Adoption", a: 78, b: 42 },
              { metric: "Performance", a: 84, b: 60 },
              { metric: "Reliability", a: 92, b: 71 },
              { metric: "Engagement", a: 68, b: 38 },
              { metric: "Growth", a: 73, b: 22 },
            ]}>
              <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
              <PolarAngleAxis dataKey="metric" tick={axisTickStyle} />
              <Radar name="Project Cost" dataKey="a" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.4} />
              <Radar name="Light Vehicle" dataKey="b" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="MAU Trend" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="mau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="returning" stroke={CHART_COLORS[0]} fill="url(#mau)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </>
  );
}

export function AIInsightsBlock() {
  return (
    <Panel
      title="AI Generated Insights"
      subtitle="Anomalies and opportunities detected across your applications"
      actions={<Badge variant="secondary" className="gap-1 text-[10px]"><Sparkles className="h-3 w-3" />Updated 2m ago</Badge>}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {aiInsights.map((i) => (
          <div key={i.title} className="rounded-lg border bg-background/40 p-3.5">
            <div className="flex items-start gap-2.5">
              <div className={cn(
                "mt-0.5 rounded-md p-1.5",
                i.tone === "destructive" && "bg-destructive/10 text-destructive",
                i.tone === "warning" && "bg-[color:var(--warning)]/10 text-[oklch(var(--warning))]",
                i.tone === "success" && "bg-[color:var(--success)]/10 text-[oklch(var(--success))]",
              )}>
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{i.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function InsightsSection() {
  return (
    <>
      <AIInsightsBlock />
      <Panel title="Recommended Actions">
        <ul className="space-y-2 text-sm">
          {[
            { icon: AlertOctagon, tone: "destructive", text: "Roll back v2.14.0 on Flight Booking to mitigate /bookings/create 500s." },
            { icon: Gauge, tone: "warning", text: "Investigate LCP regression on /projects/cost-summary after May 28 deploy." },
            { icon: Users, tone: "info", text: "Trigger onboarding flow for the 412 new users from last 30 days." },
            { icon: TrendingDown, tone: "warning", text: "Schedule review of Light Vehicle Mgmt module (6% MAU)." },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <li key={i} className="flex items-center gap-3 rounded-lg border bg-background/40 p-3">
                <div className={cn(
                  "rounded-md p-1.5",
                  a.tone === "destructive" && "bg-destructive/10 text-destructive",
                  a.tone === "warning" && "bg-[color:var(--warning)]/10 text-[oklch(var(--warning))]",
                  a.tone === "info" && "bg-[color:var(--info)]/10 text-[oklch(var(--info))]",
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-foreground">{a.text}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
