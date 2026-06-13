// Mock data generators for the analytics dashboard.
export const APPLICATIONS = [
  "Heavy Vehicle Mgmt",
  "Light Vehicle Mgmt",
  "Flight Booking",
  "Project Cost Mgmt",
  "Admin Portal",
  "HR Suite",
  "Procurement",
  "Asset Tracker",
];

export const DEPARTMENTS = [
  "Operations",
  "Logistics",
  "Finance",
  "Engineering",
  "Travel",
  "Procurement",
  "HR",
  "IT",
];

export const USERS = [
  "a.khan@corp",
  "j.silva@corp",
  "m.tanaka@corp",
  "p.oduya@corp",
  "s.muller@corp",
  "r.chen@corp",
  "k.patel@corp",
  "l.garcia@corp",
];

const seed = (i: number, base = 1) =>
  Math.abs(Math.sin(i * 9301 + base * 49297) * 233280) % 1;

export const usageTrend = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  sessions: Math.round(4000 + seed(i, 1) * 3500 + i * 60),
  users: Math.round(1200 + seed(i, 2) * 900 + i * 18),
  pageViews: Math.round(15000 + seed(i, 3) * 9000 + i * 200),
}));

export const trafficDistribution = APPLICATIONS.map((name, i) => ({
  name,
  value: Math.round(2000 + seed(i, 7) * 9000),
}));

export const topApps = [...trafficDistribution]
  .sort((a, b) => b.value - a.value)
  .slice(0, 5);

export const leastApps = [...trafficDistribution]
  .sort((a, b) => a.value - b.value)
  .slice(0, 4);

export const activeUsersTimeline = Array.from({ length: 24 }).map((_, i) => ({
  hour: `${i}:00`,
  active: Math.round(120 + seed(i, 11) * 800 + Math.sin(i / 3) * 200),
}));

export const userGrowth = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  new: Math.round(80 + seed(i, 5) * 200),
  returning: Math.round(400 + seed(i, 6) * 600 + i * 30),
}));

export const mostActiveUsers = USERS.map((u, i) => ({
  user: u,
  sessions: Math.round(150 + seed(i, 13) * 500),
  events: Math.round(800 + seed(i, 14) * 3000),
})).sort((a, b) => b.sessions - a.sessions);

export const mostActiveDepts = DEPARTMENTS.map((d, i) => ({
  dept: d,
  users: Math.round(40 + seed(i, 17) * 300),
})).sort((a, b) => b.users - a.users);

export const topPages = [
  "/dashboard",
  "/vehicles/heavy/list",
  "/bookings/flights/new",
  "/projects/cost-summary",
  "/admin/users",
  "/reports/monthly",
  "/assets/inventory",
  "/procurement/orders",
].map((p, i) => ({
  path: p,
  views: Math.round(2200 + seed(i, 19) * 9000),
  avgTime: Math.round(40 + seed(i, 20) * 220),
}));

export const entryPages = topPages.slice(0, 5).map((p) => ({ ...p, entries: Math.round(p.views * 0.4) }));
export const exitPages = topPages.slice(2, 7).map((p) => ({ ...p, exits: Math.round(p.views * 0.25) }));

export const pageVisitTrends = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  dashboard: Math.round(2000 + seed(i, 21) * 1500),
  vehicles: Math.round(1400 + seed(i, 22) * 1200),
  bookings: Math.round(1100 + seed(i, 23) * 900),
  projects: Math.round(900 + seed(i, 24) * 700),
}));

export const featuresUsage = [
  "Export CSV",
  "Bulk Edit",
  "Saved Filter",
  "Approve Workflow",
  "Calendar View",
  "Map View",
  "AI Suggest",
  "Bookmark",
].map((f, i) => ({
  feature: f,
  uses: Math.round(400 + seed(i, 25) * 3500),
  adoption: Math.round(15 + seed(i, 26) * 80),
}));

export const featureTrend = Array.from({ length: 12 }).map((_, i) => ({
  week: `W${i + 1}`,
  export: Math.round(200 + seed(i, 27) * 400 + i * 10),
  approve: Math.round(120 + seed(i, 28) * 300 + i * 8),
  ai: Math.round(20 + i * 35 + seed(i, 29) * 100),
}));

export const sessionDuration = [
  { bucket: "0–30s", count: 1200 },
  { bucket: "30s–1m", count: 1800 },
  { bucket: "1–3m", count: 2900 },
  { bucket: "3–10m", count: 3400 },
  { bucket: "10–30m", count: 2100 },
  { bucket: "30m+", count: 700 },
];

export const webVitals = [
  { metric: "LCP", value: 2.1, target: 2.5, unit: "s" },
  { metric: "FID", value: 78, target: 100, unit: "ms" },
  { metric: "CLS", value: 0.08, target: 0.1, unit: "" },
  { metric: "TTFB", value: 320, target: 500, unit: "ms" },
  { metric: "INP", value: 180, target: 200, unit: "ms" },
];

export const slowestPages = topPages
  .map((p, i) => ({ path: p.path, loadMs: Math.round(800 + seed(i, 31) * 2600) }))
  .sort((a, b) => b.loadMs - a.loadMs)
  .slice(0, 6);

export const slowestApps = APPLICATIONS.map((a, i) => ({
  app: a,
  loadMs: Math.round(700 + seed(i, 32) * 2400),
})).sort((a, b) => b.loadMs - a.loadMs).slice(0, 5);

export const apiResponseTrend = Array.from({ length: 24 }).map((_, i) => ({
  hour: `${i}:00`,
  p50: Math.round(110 + seed(i, 33) * 80),
  p95: Math.round(320 + seed(i, 34) * 220),
  p99: Math.round(620 + seed(i, 35) * 400),
}));

export const errorTrend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  js: Math.round(20 + seed(i, 41) * 80),
  api: Math.round(15 + seed(i, 42) * 70),
}));

export const topErrors = [
  { type: "TypeError: undefined property", count: 412, severity: "high" },
  { type: "API 500 /bookings/create", count: 287, severity: "high" },
  { type: "Network Timeout /assets", count: 198, severity: "medium" },
  { type: "ChunkLoadError", count: 142, severity: "medium" },
  { type: "API 401 /auth/refresh", count: 96, severity: "low" },
];

export const liveActivity = [
  { user: "a.khan@corp", action: "viewed", target: "/projects/cost-summary", app: "Project Cost Mgmt", t: "2s" },
  { user: "m.tanaka@corp", action: "exported", target: "Vehicle Report (CSV)", app: "Heavy Vehicle Mgmt", t: "8s" },
  { user: "p.oduya@corp", action: "created", target: "Flight Booking #4821", app: "Flight Booking", t: "14s" },
  { user: "j.silva@corp", action: "approved", target: "PO-9921", app: "Procurement", t: "22s" },
  { user: "s.muller@corp", action: "viewed", target: "/admin/users", app: "Admin Portal", t: "31s" },
  { user: "k.patel@corp", action: "updated", target: "Asset #A-3320", app: "Asset Tracker", t: "44s" },
  { user: "l.garcia@corp", action: "errored", target: "API 500 /bookings/create", app: "Flight Booking", t: "1m" },
];

export const navFlow = [
  { from: "Login", to: "Dashboard", value: 9800 },
  { from: "Dashboard", to: "Heavy Vehicle Mgmt", value: 3200 },
  { from: "Dashboard", to: "Flight Booking", value: 2400 },
  { from: "Dashboard", to: "Project Cost Mgmt", value: 1900 },
  { from: "Heavy Vehicle Mgmt", to: "Reports", value: 1100 },
  { from: "Flight Booking", to: "Reports", value: 800 },
  { from: "Project Cost Mgmt", to: "Admin Portal", value: 420 },
];

export const crossAppMovement = [
  { app: "Admin Portal → HR Suite", users: 312 },
  { app: "Heavy Vehicle → Asset Tracker", users: 278 },
  { app: "Flight Booking → Project Cost", users: 198 },
  { app: "Procurement → Project Cost", users: 167 },
  { app: "Light Vehicle → Heavy Vehicle", users: 142 },
];

export const aiInsights = [
  {
    title: "Flight Booking errors spiked 38% this week",
    detail: "API 500 on /bookings/create concentrated between 14:00–16:00 UTC. Correlated with deploy v2.14.0.",
    tone: "destructive" as const,
  },
  {
    title: "AI Suggest adoption is accelerating",
    detail: "Weekly usage up 4.2x over 8 weeks. Engineering and Operations drive 71% of activations.",
    tone: "success" as const,
  },
  {
    title: "Light Vehicle Mgmt is underutilized",
    detail: "Only 6% of eligible users active in last 30 days. Consider onboarding nudges or sunsetting unused modules.",
    tone: "warning" as const,
  },
  {
    title: "LCP regressed on /projects/cost-summary",
    detail: "p75 LCP moved from 1.9s → 2.7s after the dashboard widget refactor on May 28.",
    tone: "warning" as const,
  },
];
