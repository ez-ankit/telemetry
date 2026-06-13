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
