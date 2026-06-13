# Telemetry

Enterprise application monitoring and user activity analytics dashboard. Telemetry captures how users interact with enterprise applications — page views, feature usage, session behavior, and performance metrics — and surfaces it all in a real-time analytics interface.

## Features

- **Cross-application analytics** — Monitor 8+ enterprise modules (Heavy Vehicle Mgmt, Flight Booking, Project Cost, HR Suite, etc.) from a single pane
- **User behavior tracking** — Session replays, journey mapping, feature adoption, and page-level engagement
- **Real-time activity feed** — Live stream of user actions, errors, and system events across all applications
- **Performance monitoring** — Web vitals (LCP, FID, CLS), API latency trends, slowest pages and applications
- **Error tracking** — JS exceptions, API failures, severity-based alerting with trend analysis
- **AI-generated insights** — Automated anomaly detection, adoption recommendations, and regression alerts
- **12 dashboard sections** — Overview, Applications, Users, Pages, Features, User Journey, Sessions, Performance, Errors, Real-Time, Executive, AI Insights

## Dashboard Sections

| Section | What it shows |
|---------|---------------|
| **Overview** | KPI summary, usage trends, traffic distribution, top/least used apps, AI insights |
| **Applications** | Per-app adoption, engagement, traffic breakdown, at-risk modules |
| **Users** | MAU/WAU/DAU, active timeline, growth trends, most active users and departments |
| **Pages** | Most visited pages, entry/exit pages, visit trends over time |
| **Features** | Feature usage ranking, adoption rates, weekly feature trends |
| **User Journey** | Navigation flows, cross-app movement, session path samples |
| **Sessions** | Avg session duration, bounce rate, engagement score, duration distribution |
| **Performance** | Web vitals, API response time percentiles, slowest apps and pages |
| **Errors** | JS vs API error trends, top error categories with severity |
| **Real-Time** | Live user count, active apps, events/min, live activity feed |
| **Executive** | Adoption rate, health matrix, MAU trend, key business metrics |
| **AI Insights** | Automated anomaly detection, recommendations, and action items |

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, shadcn/ui, Tailwind CSS v4
- **Charts:** Recharts
- **State:** TanStack React Query
- **SDK:** Vanilla JS — IndexedDB queue, Beacon API transport, exponential backoff retry

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd telemetry

# 2. Install dependencies (all workspaces)
npm install

# 3. Start the dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dashboard loads with mock data — no external services required.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | Run ESLint |

## Project Structure

```
telemetry/
├── apps/
│   └── web/              # Next.js dashboard
│       └── src/
│           ├── app/           # App Router pages + BFF API routes
│           ├── components/    # Dashboard UI components
│           ├── server/        # BFF services, controllers, repositories
│           └── lib/           # Utilities and mock data
├── packages/              # Shared libraries
└── infra/                 # Docker, Kubernetes, observability
```

## Mock Data

The dashboard is currently powered by `src/lib/mock-data.ts` which generates realistic analytics data for all 12 sections. No database or backend services are required for development. The BFF API routes at `app/api/*` are wired to return this data — replace the service implementations with real database queries when ready.

## Deployment

```bash
# Build the Next.js standalone server
cd apps/web
npm run build

# Start
node .next/standalone/server.js
```

The app also builds as a Docker image — see `apps/web/Dockerfile`.

## Architecture Overview

The full platform extends beyond the dashboard into a multi-service pipeline:

```
Browser SDK → Collector API → Kafka → Worker Consumer → ClickHouse
                                                             ↓
Dashboard (BFF) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

- **SDK** — Embedded in customer websites, queues events in IndexedDB, sends via Beacon API
- **Collector API** — Validates and publishes events to Kafka
- **Worker Consumer** — Transforms and batch-writes to ClickHouse
- **Dashboard** — Queries ClickHouse (analytics) and PostgreSQL (metadata) through BFF API routes
