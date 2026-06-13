# Enterprise Analytics Platform — System Design & Application Folder Structure

## 1. Monorepo Root Structure

**Purpose:** A single repository housing all applications and shared packages. Managed with Turborepo or Nx for coordinated builds, dependency management, and caching.

- **`apps/`** — Deployable services (Next.js dashboard, collector API, worker consumer, realtime gateway).
- **`packages/`** — Shared libraries consumed by apps: database clients, auth, analytics logic, types, logger, config, SDK.
- **`infra/`** — Infrastructure-as-code for Docker, Kubernetes, Kafka, ClickHouse, PostgreSQL, and observability stack.
- **`scripts/`** — Operational scripts (migrations, seeding, maintenance).
- **`docs/`** — Architecture decision records, API specs, runbooks.
- **`.github/`** — CI/CD pipelines and GitHub Actions workflows.

```
enterprise-analytics-platform/
│
├── apps/
│   ├── web/                       # Next.js Dashboard (BFF + UI)
│   ├── collector-api/            # Event ingestion API (high throughput)
│   ├── worker-consumer/          # Kafka → ClickHouse writer
│   ├── realtime-gateway/         # WebSocket / SSE server
│
├── packages/
│   ├── db-postgres/              # Prisma/Drizzle PostgreSQL client + schema
│   ├── db-clickhouse/            # ClickHouse client + query layer
│   ├── analytics-core/           # Event models, aggregation logic
│   ├── auth/                     # Auth utilities (JWT, RBAC)
│   ├── shared-types/             # Global TypeScript types
│   ├── logger/                   # Pino/Winston logging setup
│   ├── config/                   # Env + config loader
│   ├── sdk/                      # Frontend analytics SDK (Segment-like)
│
├── infra/
│   ├── docker/
│   ├── kubernetes/
│   ├── kafka/
│   ├── clickhouse/
│   ├── postgres/
│
├── scripts/                     # migrations, seeding, maintenance jobs
├── docs/                        # architecture, API specs
├── .github/                     # CI/CD pipelines
├── package.json
├── turbo.json / nx.json         # monorepo orchestrator
└── README.md
```

---

## 2. Next.js App (`apps/web`) — Dashboard + BFF

**Purpose:** Main product UI and Backend-for-Frontend (BFF) layer. Serves the dashboard and proxies/composes data from downstream services into frontend-friendly APIs.

- **`app/`** — Next.js App Router with route groups for auth, dashboard pages, settings, and BFF API routes.
- **`components/`** — Reusable UI primitives, chart wrappers, dashboard layouts, and data tables.
- **`features/`** — Domain-driven UI modules, each encapsulating a product domain (analytics, monitoring, users, alerts).
- **`lib/`** — Client initializers for PostgreSQL, ClickHouse, auth, and HTTP fetcher.
- **`server/`** — Server-only BFF logic: services orchestrate business logic, repositories abstract data access, controllers handle request/response, validators enforce schema compliance.
- **`hooks/`** — React hooks for data fetching and state.
- **`store/`** — Client-side state management (Zustand or Redux).
- **`middleware.ts`** — Next.js middleware for auth checks, redirects, or rewrites.
- **`env.ts`** — Type-safe environment variable validation.

```
apps/web/
│
├── app/                         # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │
│   ├── dashboard/
│   │   ├── overview/
│   │   ├── analytics/
│   │   ├── users/
│   │   ├── services/
│   │   ├── alerts/
│   │
│   ├── api/                     # BFF routes
│   │   ├── analytics/
│   │   ├── events/
│   │   ├── metrics/
│   │   ├── dashboards/
│   │   ├── alerts/
│   │
│   ├── settings/
│   └── layout.tsx
│
├── components/
│   ├── ui/                      # buttons, inputs, modals
│   ├── charts/                  # chart wrappers (Recharts/ECharts)
│   ├── dashboards/
│   ├── tables/
│   ├── layout/
│
├── features/                    # domain-driven UI modules
│   ├── analytics/
│   ├── monitoring/
│   ├── users/
│   ├── alerts/
│
├── lib/
│   ├── postgres.ts
│   ├── clickhouse.ts
│   ├── auth.ts
│   ├── fetcher.ts
│
├── server/                      # server-only logic (BFF layer)
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── events.service.ts
│   │   ├── alerts.service.ts
│   │
│   ├── repositories/
│   ├── controllers/
│   ├── validators/
│
├── hooks/
├── store/                      # Zustand/Redux
├── middleware.ts
└── env.ts
```

---

## 3. Event Collector API (`apps/collector-api`)

**Purpose:** High-throughput ingestion endpoint that receives analytics events from the SDK and publishes them to Kafka. Designed for low-latency, high-concurrency writes.

- **`routes/`** — HTTP route handlers: event collection and health checks.
- **`controllers/`** — Request parsing and response formatting.
- **`services/`** — Validation service (schema enforcement) and queue service (Kafka producer).
- **`middlewares/`** — Rate limiting per tenant/IP and auth verification.
- **`schemas/`** — Zod or Joi schemas for event structure validation.

```
apps/collector-api/
│
├── src/
│   ├── routes/
│   │   ├── collect-events.ts
│   │   ├── health.ts
│   │
│   ├── controllers/
│   ├── services/
│   │   ├── validation.service.ts
│   │   ├── queue.service.ts
│   │
│   ├── middlewares/
│   │   ├── rate-limit.ts
│   │   ├── auth.ts
│   │
│   ├── schemas/                # zod / joi event schemas
│   ├── utils/
│   └── app.ts
│
├── Dockerfile
└── tsconfig.json
```

---

## 4. Worker Consumer (`apps/worker-consumer`)

**Purpose:** Kafka consumer service that reads event and metric messages from topics, transforms/validates them, and batch-writes into ClickHouse for analytics querying.

- **`consumers/`** — Kafka consumer groups for events and metrics topics.
- **`processors/`** — Event and batch processing logic: deserialization, enrichment, batching.
- **`clickhouse/`** — ClickHouse writer client and query utilities for insert operations.
- **`kafka/`** — Kafka client configuration and topic definitions.

```
apps/worker-consumer/
│
├── src/
│   ├── consumers/
│   │   ├── events.consumer.ts
│   │   ├── metrics.consumer.ts
│   │
│   ├── processors/
│   │   ├── event.processor.ts
│   │   ├── batch.processor.ts
│   │
│   ├── clickhouse/
│   │   ├── writer.ts
│   │   ├── queries.ts
│   │
│   ├── kafka/
│   │   ├── client.ts
│   │   ├── topics.ts
│   │
│   └── index.ts
```

---

## 5. Realtime Gateway (`apps/realtime-gateway`)

**Purpose:** WebSocket and SSE server that pushes live metrics, events, and alerts to connected dashboard clients. Subscribes to Kafka topics and fans out to channel subscribers.

- **`websocket/`** — WebSocket server setup and connection handler logic.
- **`streams/`** — Kafka stream consumer that bridges message broker to realtime channels.
- **`channels/`** — Named channels for different data types (metrics, alerts), managing subscriber sets and message broadcast.

```
apps/realtime-gateway/
│
├── src/
│   ├── websocket/
│   │   ├── server.ts
│   │   ├── handlers.ts
│   │
│   ├── streams/
│   │   ├── kafka-stream.ts
│   │
│   ├── channels/
│   │   ├── metrics.channel.ts
│   │   ├── alerts.channel.ts
│
│   └── index.ts
```

---

## 6. PostgreSQL Package (`packages/db-postgres`)

**Purpose:** Shared PostgreSQL client, schema definitions (Prisma or Drizzle), and repository layer for all apps. Manages relational data: users, organizations, dashboards, alerts, settings.

- **`prisma/` or `drizzle/`** — Schema definitions and migration files.
- **`client.ts`** — Singleton database client export.
- **`repositories/`** — Data access objects (UserRepo, OrgRepo, AlertRepo) encapsulating queries.
- **`types.ts`** — Generated or hand-written TypeScript types matching the schema.

```
packages/db-postgres/
│
├── prisma/ OR drizzle/
│   ├── schema.prisma
│   ├── migrations/
│
├── client.ts
├── repositories/
│   ├── user.repo.ts
│   ├── org.repo.ts
│   ├── alert.repo.ts
│
└── types.ts
```

---

## 7. ClickHouse Package (`packages/db-clickhouse`)

**Purpose:** Shared ClickHouse client and query layer for columnar analytics. Handles high-volume read/write operations for events, metrics, and funnel analysis.

- **`client.ts`** — ClickHouse connection and session management.
- **`queries/`** — Typed query builders for events, metrics, and funnels.
- **`models/`** — Data models mapping ClickHouse tables to TypeScript interfaces.
- **`utils.ts`** — Serialization helpers, batch formatting, and query parameter utilities.

```
packages/db-clickhouse/
│
├── client.ts
├── queries/
│   ├── events.query.ts
│   ├── metrics.query.ts
│   ├── funnels.query.ts
│
├── models/
│   ├── event.model.ts
│
└── utils.ts
```

---

## 8. Analytics Core (`packages/analytics-core`)

**Purpose:** Domain logic for analytics computations shared across apps and services. Contains business rules for funnel building, retention analysis, cohort calculation, and event aggregation.

- **`funnels/`** — Funnel builder and computation engine (step ordering, conversion rates, drop-off analysis).
- **`retention/`** — Cohort definition and retention calculation logic.
- **`aggregation/`** — Time-series aggregation strategies: hourly rollups and real-time windowed counts.
- **`events/`** — Base event tracker interface and event schema validators.
- **`utils.ts`** — Math helpers, date utilities, and statistical functions.

```
packages/analytics-core/
│
├── funnels/
│   ├── builder.ts
│   ├── compute.ts
│
├── retention/
│   ├── cohort.ts
│
├── aggregation/
│   ├── hourly.ts
│   ├── realtime.ts
│
├── events/
│   ├── tracker.ts
│   ├── schema.ts
│
└── utils.ts
```

---

## 9. Auth Package (`packages/auth`)

**Purpose:** Authentication and authorization utilities shared across all apps. Provides JWT issuance/verification, session management, and Role-Based Access Control (RBAC).

- **`jwt.ts`** — JWT signing, verification, and refresh token logic.
- **`session.ts`** — Session store abstraction (database-backed or Redis).
- **`rbac.ts`** — Role hierarchy and permission resolution engine.
- **`permissions.ts`** — Granular permission definitions (read, write, admin scopes per resource).
- **`middleware.ts`** — Express/Next.js-compatible auth middleware.

```
packages/auth/
│
├── jwt.ts
├── session.ts
├── rbac.ts
├── permissions.ts
└── middleware.ts
```

---

## 10. SDK (`packages/sdk`)

**Purpose:** Browser-side analytics SDK that captures user interactions, queues them, and sends batches to the collector API. Designed to be lightweight, non-blocking, and privacy-compliant.

- **`tracker.ts`** — Public API: `track()`, `identify()`, `page()` methods.
- **`queue.ts`** — In-memory event queue with flush-on-interval and flush-on-page-exit strategies.
- **`transport.ts`** — HTTP transport layer (Beacon API, fetch, XHR fallback).
- **`types.ts`** — Event type definitions and configuration interfaces.

packages/sdk/
│
├── src/
│   ├── tracker.ts
│   ├── queue.ts
│   ├── transport.ts
│   ├── types.ts
│
└── index.ts
```

**Usage:**
```ts
analytics.track("page_view", {
  userId,
  url: "/dashboard"
});
```

---

## 11. Infra Folder

**Purpose:** Infrastructure-as-code and deployment configurations for all platform dependencies. Ensures reproducible environments across dev, staging, and production.

- **`docker/`** — Docker Compose files for local development (PostgreSQL, ClickHouse, Kafka).
- **`kubernetes/`** — K8s manifests for each deployable app (web, collector, worker).
- **`observability/`** — Prometheus scraping configs and Grafana dashboard definitions.

```
infra/
│
├── docker/
│   ├── postgres.yml
│   ├── clickhouse.yml
│   ├── kafka.yml
│
├── kubernetes/
│   ├── web.yaml
│   ├── collector.yaml
│   ├── worker.yaml
│
└── observability/
    ├── prometheus.yml
    ├── grafana/
```

---

## Key Design Principles

1. **Separation of workloads**
   - OLTP → PostgreSQL
   - OLAP → ClickHouse
   - Streaming → Kafka

2. **Microservice-ready but monorepo-managed**
   - Easy to split later
   - Shared types prevent duplication

3. **Event-driven architecture**
   - SDK → API → Queue → Worker → ClickHouse

4. **BFF pattern in Next.js**
   - Keeps frontend fast
   - Hides backend complexity

---

## Architecture Alignment Analysis

### Current Implementation State

| Layer | Status | Details |
|-------|--------|---------|
| **UI Dashboard** | Built | Single-page analytics dashboard with 12 sections, Recharts, shadcn/ui |
| **Browser SDK** | Built | Offline-first analytics SDK with IndexedDB, event queue, background sync |
| **Web BFF (API routes)** | Not built | No server-side API layer; all data is client-side mocked |
| **Collector API** | Not built | Missing; SDK targets `/api/analytics/collect` but no handler exists |
| **Worker Consumer** | Not built | Missing |
| **Realtime Gateway** | Not built | Missing |
| **PostgreSQL** | Not built | Missing |
| **ClickHouse** | Not built | Missing |
| **Auth / RBAC** | Not built | Missing |
| **Infra (Docker/K8s)** | Not built | Missing |
| **Monorepo structure** | Not implemented | Single root; no `apps/` or `packages/` split |

### Key Inconsistencies

1. **Dual routing system** — Next.js App Router files (`src/app/`) coexist with an active TanStack Start build. The `b2bc207` commit began a Next.js migration but it is incomplete; the build system still runs on Vite + TanStack Start. Pages are duplicated across both routers.

2. **No backend connectivity** — All dashboard data is served from `src/lib/mock-data.ts`. There are zero API calls, zero database queries, zero real data sources. The dashboard is a static prototype.

3. **Orphaned SDK** — The browser SDK (`sdk/`) is fully featured but has no backend endpoint to receive events. The sidebar shows "SDK v2.4.1" but the source is version 1.0.0.

4. **Missing BFF layer** — `SYSTEM_DESIGN.md` calls for Next.js API routes acting as a BFF (server/services, repositories, controllers, validators), but none exist.

---

## Revised Architecture Overview

### High-Level Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Website                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Embedded JS SDK                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │
│  │  │ Page     │  │ Click    │  │ API Call │  │ Metrics      │ │  │
│  │  │ Tracker  │  │ Tracker  │  │ Tracker  │  │ Collector    │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │  │
│  │       └──────────────┴─────────────┴────────────────┘         │  │
│  │                        │                                       │  │
│  │  ┌─────────────────────▼──────────────────────────────────┐   │  │
│  │  │               Event Queue Layer                         │   │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐ │   │  │
│  │  │  │ Durable    │  │ IndexedDB  │  │ Sync Engine      │ │   │  │
│  │  │  │ Queue      │  │ Store      │  │ (Batch + Retry)  │ │   │  │
│  │  │  └────────────┘  └────────────┘  └────────┬─────────┘ │   │  │
│  │  └───────────────────────────────────────────┼─────────────┘   │  │
│  │                                               │                 │  │
│  │  ┌────────────────────────────────────────────▼──────────────┐  │  │
│  │  │  Transport Layer (Beacon API → fetch fallback)            │  │  │
│  │  └───────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘
│                          │ HTTP POST (batched events)
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │                    COLLECTOR API                                 ││
│ │  POST /v1/collect     │  Auth Middleware  │  Rate Limiter       ││
│ │  POST /v1/identify    │  Validation (Zod) │  Kafka Producer    ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                 │                                    │
│                                 ▼                                    │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │                         KAFKA                                    ││
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  ││
│ │  │ events.raw   │  │ identify     │  │ metrics.aggregated   │  ││
│ │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  ││
│ └─────────┼──────────────────┼─────────────────────┼──────────────┘│
│           │                  │                     │                │
│           ▼                  ▼                     ▼                │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │                    WORKER CONSUMER                               ││
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  ││
│ │  │ Event        │  │ Batch        │  │ ClickHouse Writer    │  ││
│ │  │ Processor    │  │ Processor    │  │ (MergeTree inserts)  │  ││
│ │  └──────────────┘  └──────────────┘  └──────────┬───────────┘  ││
│ └──────────────────────────────────────────────────┼──────────────┘│
│                                                     │              │
│                                                     ▼              │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │                    CLICKHOUSE                                   ││
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  ││
│ │  │ events       │  │ metrics      │  │ materialized views   │  ││
│ │  └──────────────┘  └──────────────┘  └──────────────────────┘  ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                    ▲                │
│ ┌──────────────────────────────────────────────────┼──────────────┐│
│ │              REALTIME GATEWAY                    │              ││
│ │  ┌──────────────┐  ┌─────────────────────────────┘              ││
│ │  │ Kafka Stream │──┘                                            ││
│ │  │ Consumer     │──┐                                            ││
│ │  └──────────────┘  │  ┌──────────────┐  ┌──────────────────────┐││
│ │                    ├──│ Metrics      │  │ WebSocket Server     │││
│ │                    │  │ Channel      │──│ (WS / SSE)           │││
│ │                    │  └──────────────┘  └──────────┬───────────┘││
│ │                    │  ┌──────────────┐             │            ││
│ │                    └──│ Alerts       │             │            ││
│ │                       │ Channel      │             │            ││
│ │                       └──────────────┘             │            ││
│ └─────────────────────────────────────────────────────┼───────────┘│
└───────────────────────────────────────────────────────┼───────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS DASHBOARD (BFF + UI)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    BFF API ROUTES                             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │   │
│  │  │ /api/      │  │ /api/      │  │ /api/      │  │ /api/  │ │   │
│  │  │ analytics  │  │ events     │  │ metrics    │  │ alerts │ │   │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └───┬────┘ │   │
│  │         └───────────────┴───────────────┴────────────┘       │   │
│  │                          │                                    │   │
│  │              ┌───────────▼───────────┐                        │   │
│  │              │   BFF Services        │                        │   │
│  │              │   - Query ClickHouse  │                        │   │
│  │              │   - Query PostgreSQL  │                        │   │
│  │              │   - Aggregate data    │                        │   │
│  │              │   - Auth context      │                        │   │
│  │              └───────────────────────┘                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    UI LAYER                                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│   │
│  │  │Dashboard │ │Analytics │ │ Users    │ │ Alerts           ││   │
│  │  │Pages     │ │Charts    │ │Management│ │ & Notifications  ││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘│   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │      POSTGRESQL          │
                    │  users, orgs, settings,  │
                    │  dashboards, alerts      │
                    └──────────────────────────┘
```

### Data Flow

**Flow A — Event Ingestion (SDK → ClickHouse)**

```
Client Website → SDK → Collector API → Kafka → Worker Consumer → ClickHouse
                                                                     │
                                                                     ▼
                                                            Dashboard queries
                                                            via BFF API
```

1. SDK captures events (page views, clicks, API calls) on the client website
2. Events are queued in IndexedDB for durability and batched for efficiency
3. Sync Engine sends batches via Beacon API (or fetch fallback) to Collector API
4. Collector API validates the payload (Zod schemas), applies rate limiting, publishes to Kafka topic `events.raw`
5. Worker Consumer picks up messages, transforms/enriches them, batches into large inserts
6. ClickHouse stores events in MergeTree tables optimized for analytics queries

**Flow B — Real-Time Dashboard (Kafka → WebSocket)**

```
Kafka → Realtime Gateway → WebSocket/SSE → Dashboard UI
```

1. Realtime Gateway subscribes to Kafka topics (metrics, alerts)
2. Channels fan out messages to connected WebSocket/SSE clients
3. Dashboard UI receives live updates without polling

**Flow C — Dashboard Data (BFF → UI)**

```
Dashboard UI → BFF API Route → Service Layer → ClickHouse / PostgreSQL → Response
```

1. Dashboard pages call BFF API routes (`/api/analytics/*`, `/api/metrics/*`)
2. BFF services orchestrate queries across ClickHouse (analytics) and PostgreSQL (metadata)
3. Data is aggregated, serialized, and returned to the frontend

**Flow D — Authentication (Website → BFF → PostgreSQL)**

```
Dashboard UI → Next.js Middleware → Auth Service → PostgreSQL (users + sessions)
```

1. Next.js middleware checks JWT/session on every request
2. Auth service resolves roles and permissions via RBAC
3. Protected routes redirect to login if unauthenticated

---

## Component Responsibilities

### 1. Embedded JavaScript SDK (`sdk/`)

**Role:** Client-side telemetry agent embedded via `<script>` tag on customer websites.

**Responsibilities:**
- Auto-track page views, clicks, and API calls via monkey-patched browser APIs
- Manage session state (sessionStorage, 30-min expiry) and visitor identity (localStorage, persistent)
- Queue events in IndexedDB for durability against network failures
- Batch-send events via Beacon API with fetch/XHR fallback
- Retry failed transmissions with exponential backoff
- Report SDK health metrics (enqueued, synced, failed counts)
- Respect user privacy (configurable tracking whitelist, PII sanitization)

**Configuration:** Accepts `apiKey`, `endpoint`, `trackingWhitelist`, `batchSize`, `syncInterval` via `window._analyticsConfig` or script `data-*` attributes.

### 2. Client Websites

**Role:** Host pages instrumented with the SDK.

**Responsibilities:**
- Embed SDK via `<script async src="https://cdn.example.com/analytics.min.js" data-api-key="...">`
- Optionally provide user context (`window._analyticsConfig.userId`, `window._analyticsConfig.role`)
- SDK operates autonomously; no additional integration work required beyond the script tag

### 3. Collector API (`apps/collector-api`)

**Role:** High-throughput HTTP ingestion gateway.

**Responsibilities:**
- Accept POST requests with batched event payloads
- Validate every event against Zod schemas (structure, required fields, types)
- Enforce per-tenant rate limiting (token bucket or sliding window)
- Authenticate requests via API key (Bearer token in Authorization header)
- Publish validated events to Kafka topic `events.raw`
- Return immediate 202 Accepted; event processing is async
- Expose health and metrics endpoints for monitoring

### 4. Web BFF (Next.js API Routes)

**Role:** Backend-for-Frontend that serves the dashboard UI.

**Responsibilities:**
- Expose RESTful API routes consumed by the dashboard UI (`/api/analytics`, `/api/metrics`, `/api/events`, `/api/alerts`, `/api/dashboards`)
- Aggregate data from ClickHouse (analytics) and PostgreSQL (metadata) into UI-friendly responses
- Enforce authentication and authorization (JWT validation, RBAC scoping)
- Handle session management and refresh tokens
- Provide server-side filtering, pagination, and sorting for dashboard queries
- Cache frequent queries (in-memory or Redis) for dashboard performance

### 5. Worker Consumer (`apps/worker-consumer`)

**Role:** Stream processor bridging Kafka to ClickHouse.

**Responsibilities:**
- Consume messages from Kafka topics (`events.raw`, `identify`)
- Deserialize, validate, and enrich events (add geolocation, device info, etc.)
- Batch events into large inserts for ClickHouse efficiency
- Handle schema evolution and dead-letter queue for malformed messages
- Report consumer lag and processing metrics

### 6. Realtime Gateway (`apps/realtime-gateway`)

**Role:** Real-time event broadcaster.

**Responsibilities:**
- Maintain persistent WebSocket connections with dashboard clients
- Subscribe to Kafka topics and push new data to subscribed channels
- Handle connection lifecycle (connect, disconnect, reconnect)
- Support SSE fallback for environments where WebSocket is unavailable
- Autoscale based on active connection count

### 7. PostgreSQL (`packages/db-postgres`)

**Role:** Relational data store for operational data.

**Managed Entities:**
- Users, Organizations, Teams
- Dashboard definitions and saved queries
- Alert configurations and notification rules
- User sessions and API keys
- RBAC roles and permissions

### 8. ClickHouse (`packages/db-clickhouse`)

**Role:** Columnar analytics store for event data.

**Managed Entities:**
- Raw events (page views, clicks, API calls, custom events)
- Aggregated metrics (hourly/daily counts, unique users, sessions)
- Funnel analysis data
- Retention and cohort data
- Performance and error tracking data

### 9. Auth Package (`packages/auth`)

**Role:** Centralized authentication and authorization.

**Responsibilities:**
- JWT issuance, verification, and refresh
- Session store abstraction (database-backed or Redis)
- RBAC with hierarchical roles and per-resource permissions
- Express/Next.js compatible middleware

### 10. SDK Package (`packages/sdk`)

**Role:** Future monorepo-managed version of the browser SDK.

**Note:** The current `sdk/` directory contains a functional browser SDK. In the monorepo structure, this would move to `packages/sdk/` with TypeScript source, proper bundling (Rollup/TSUP), and npm package publishing.

---

## Suggested Improvements & Optimizations

### SDK Reliability & Event Tracking

| Improvement | Description | Priority |
|------------|-------------|----------|
| **Batch coalescing** | Group events by session ID before sending to reduce request count | High |
| **Exponential backoff** | Implement jittered retry delays on failure (1s, 2s, 4s, 8s, max 60s) | High |
| **Circuit breaker** | Stop sending after N consecutive failures; resume after a cooldown period | Medium |
| **Payload compression** | Use CompressionStream API or JSON-stringify + lz-string for large batches | Medium |
| **Deduplication** | Add event ID (UUID v4) to each event; server-side dedup via ID + timestamp window | High |
| **Sampling** | Support deterministic sampling (e.g., 10% of users) for high-traffic sites | Medium |
| **PII scrubbing** | Sanitize URLs, inputs, and custom properties before queuing | High |
| **Beacon fallback chain** | Beacon API → fetch → XHR → `new Image()` as last resort | Medium |

### Data Ingestion Pipeline

| Improvement | Description | Priority |
|------------|-------------|----------|
| **Async validation** | Move schema validation to a separate worker thread in collector-api | Medium |
| **Kafka partitioning key** | Use `orgId` or `apiKey` as partition key to preserve event ordering per tenant | High |
| **Dead-letter queue** | Route malformed events to a DLQ topic for debugging without losing data | High |
| **ClickHouse table design** | Use `ReplacingMergeTree` or `CollapsingMergeTree` for deduplication | High |
| **Materialized views** | Pre-aggregate hourly/daily metrics via ClickHouse materialized views | High |
| **TTL policies** | Set TTL on raw event tables (e.g., 30 days raw, 2 years aggregated) | Medium |

### BFF & Dashboard

| Improvement | Description | Priority |
|------------|-------------|----------|
| **Complete Next.js migration** | Remove TanStack Router files, unify on Next.js App Router | **Critical** |
| **Replace mock data** | Wire dashboard to real BFF API endpoints | **Critical** |
| **React Query for data** | Use TanStack React Query (already a dependency) for server state management | High |
| **Suspense boundaries** | Add React Suspense wrappers around each dashboard section for streaming SSR | Medium |
| **API caching** | Add server-side response caching (stale-while-revalidate) for dashboard queries | Medium |

### Infrastructure

| Improvement | Description | Priority |
|------------|-------------|----------|
| **Docker Compose** | Create `docker-compose.yml` for local dev (PostgreSQL, ClickHouse, Kafka, Zookeeper) | High |
| **Health checks** | Add `/health` and `/ready` endpoints to all services | High |
| **Observability** | Integrate OpenTelemetry for distributed tracing across SDK → API → Worker → DB | Medium |
| **Rate limiter** | Implement sliding window rate limiter in collector-api (Redis-backed for distributed) | High |

### Migration Path (Current → Target Architecture)

1. **Phase 1** — Complete Next.js migration: remove TanStack Router, verify all pages work under App Router
2. **Phase 2** — Build BFF layer: implement API routes that serve real data (start with PostgreSQL for users/settings, ClickHouse for analytics)
3. **Phase 3** — Build collector-api: deploy as a standalone service, wire SDK to send events to it
4. **Phase 4** — Set up Kafka + worker-consumer: stream events from collector-api to ClickHouse
5. **Phase 5** — Build realtime-gateway: WebSocket/SSE for live dashboard updates
6. **Phase 6** — Add auth package: JWT, RBAC, session management
7. **Phase 7** — Monorepo restructure: split into `apps/` and `packages/` directories
8. **Phase 8** — Infrastructure: Docker, Kubernetes, Prometheus, Grafana

---

## Best Practices Summary

- **Offline-first design** — SDK queues events in IndexedDB; never drops data on network failure
- **Async ingestion** — Collector API returns 202 Accepted; processing is async via Kafka
- **Separation of concerns** — OLTP (PostgreSQL) for operational data, OLAP (ClickHouse) for analytics
- **BFF pattern** — Dashboard talks only to BFF; BFF aggregates across services
- **Idempotent events** — Each event has a unique ID; consumers deduplicate
- **Schema-on-write validation** — Events validated at ingestion time (Zod), not at query time
- **Batched writes** — Worker consumer batches hundreds of events per ClickHouse INSERT
- **Tenant isolation** — All queries scoped by `orgId`; Kafka partitioned by tenant
- **Observability** — Every service exports metrics; SDK reports its own health telemetry
