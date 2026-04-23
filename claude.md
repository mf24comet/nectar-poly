# CLAUDE.md

## Project Overview

This project is a demonstration service and dashboard for ingesting events from Poly Lens, storing and processing them, and presenting them in a digestible UI. The goal is to replicate and improve upon the capabilities of a beta dashboard while establishing a secure, production-ready architecture.

The system accepts events from Poly Lens integrations, persists them, transforms raw data into dashboard-ready metrics, and exposes APIs for a React frontend dashboard.

**GitHub repo:** `mf24comet/nectar-poly`

---

## Commands

```bash
cargo build                          # Build the project
cargo test                           # Run all tests
cargo clippy -- -D warnings          # Lint (treat warnings as errors)
cargo fmt --check                    # Check formatting
cargo audit                          # Dependency vulnerability scan
docker build -t nectar-poly .        # Build container image
docker run --env-file .env nectar-poly  # Run container locally

# Frontend
cd frontend
pnpm dev                             # Start Vite dev server
pnpm build                           # Production build
pnpm lint                            # ESLint
pnpm typecheck                       # tsc --noEmit
pnpm test                            # Vitest
```

---

## Tech Stack

### Backend
- Language: **Rust**
- Logging: `tracing`, `tracing-subscriber`
- Config: `config` crate + environment variables
- Auth: Basic Auth (OAuth architected for easy opt-in later)
- Testing: built-in Rust test framework + integration tests
- Database: **PostgreSQL** (parameterized queries only)

### Frontend
- **React 18** + **TypeScript** (strict mode)
- **Vite** — build tool and dev server
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — component library (unstyled primitives, copy-owned)
- **Recharts** — all charts and data visualizations
- **TanStack Query** — all server state, caching, and data fetching
- **TanStack Table** — all data tables (sorting, filtering, pagination)
- **React Router v6** — client-side routing

---

## Project Structure

```
nectar-poly/
├── CLAUDE.md
├── Dockerfile
├── docker-compose.yml
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── secrets.yaml
├── migrations/                 # PostgreSQL migrations (never mutate schema manually)
├── src/
│   ├── main.rs
│   ├── api/                    # HTTP routes, request/response types, middleware
│   ├── auth/                   # Basic Auth + OAuth stub
│   ├── ingestion/              # Poly Lens event receipt, validation, normalization
│   ├── domain/                 # Device, alert, utilization business logic
│   ├── storage/                # PostgreSQL repositories
│   ├── metrics/                # Dashboard aggregation and computed views
│   ├── logging/                # Tracing setup, redaction helpers
│   └── config/                 # Env-driven application config
└── frontend/
    ├── src/
    │   ├── components/         # Shared reusable UI components
    │   │   └── ui/             # shadcn/ui primitives
    │   ├── pages/              # One folder per dashboard page
    │   ├── api/                # TanStack Query hooks + fetch functions
    │   ├── types/              # Shared TypeScript types (mirrors backend models)
    │   ├── lib/                # Utility functions, formatters
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── package.json
```

---

## Never Do

- Never log authorization headers, credentials, or tokens
- Never exceed 800 lines per module — split before reaching the limit
- Never mutate the database schema outside of migrations
- Never hardcode secrets — use env vars or Kubernetes secret mounts
- Never use string interpolation in SQL — parameterized queries only
- Never push directly to `main` without tests passing
- Never put business logic in route handlers
- Never mix transport, auth, and domain logic in the same module
- Never use a non-root user in the container image
- Never use `any` in TypeScript — use proper types or `unknown`
- Never manage server state with useState/useEffect — use TanStack Query
- Never install a charting library other than Recharts
- Never install a component outside shadcn/ui without explicit discussion
- Never use inline styles — use Tailwind classes only

---

## Core Functional Requirements

### Event Ingestion
- Accept inbound events from Poly Lens integrations
- Validate and authenticate all requests (Basic Auth)
- Log all inbound events in structured JSON with redaction
- Persist raw events to PostgreSQL
- Reject malformed or unauthorized requests with clean error responses

### Logging
- Structured JSON logs throughout
- Include: request correlation ID, event type, tenant/site identifiers, processing outcome
- Redact all secrets, tokens, and raw auth headers before logging
- Distinguish clearly between: auth failure, validation failure, processing failure, DB failure

### Dashboard APIs
Expose versioned, typed JSON APIs for:
- Device inventory
- Alerts
- Software compliance
- Utilization metrics
- Site/room summaries
- Trend and SLA metrics
- Device detail drilldown

### Security
- Deny by default on all routes
- Validate and sanitize all input
- Explicit request size limits
- Rate limiting where practical
- Secure headers on all responses
- Dependency auditing enabled (`cargo audit`)
- Non-root container execution
- Minimal base image

---

## Data Flow

```
Poly Lens → ingestion endpoint
         → auth middleware validates
         → payload validated and normalized
         → event logged safely (with redaction)
         → event stored in PostgreSQL
         → derived metrics queryable
         → frontend consumes dashboard APIs
```

---

## Database

**PostgreSQL only.** All schema changes via migrations.

### Entities
- `tenants`, `sites`, `rooms`
- `devices`, `device_tags`
- `events` (append-only, raw)
- `alerts`
- `software_versions`
- `utilization_records`
- `incident_metrics`
- `audit_records`

### Rules
- Use migrations for all schema changes
- Index high-cardinality query paths (tenant, site, device, status, severity, time)
- Keep raw event tables separate from derived summary tables
- Use foreign keys where appropriate
- Design all tables to support filtering by tenant, site, device, status, severity, and time range

---

## API Conventions

- Version all routes (e.g. `/v1/...`)
- Return typed JSON on all responses
- Consistent pagination on all list endpoints
- Consistent error format: `{ error, code, request_id }`
- Support filtering and sorting on list endpoints
- Include request ID in all responses

---

## Authentication

### Basic Auth (required)
- Credentials loaded from env vars or secret mounts only
- Constant-time comparisons
- No credential values in logs
- Clean 401 on auth failure

### OAuth (optional — must be easy to enable)
- Stub the interface cleanly so it can be swapped in without rewriting auth middleware

---

## Containerization

### Docker
- Multi-stage build
- Minimal runtime image (distroless or alpine)
- Non-root user
- Healthcheck endpoint
- Tests run during build — fail build if tests fail

### Kubernetes
- Own namespace
- Own service account with least privilege
- Readiness and liveness probes
- Resource requests and limits
- Secrets via Kubernetes Secrets (never in env files committed to git)
- Network policies if available
- Read-only filesystem if practical

---

## Testing Requirements

Every feature must include tests. Builds fail if tests fail.

### Coverage areas (minimum)
- Auth validation (success and failure paths)
- Event ingestion (success, malformed, unauthorized)
- Payload validation and deserialization
- Dashboard aggregation logic
- API response formatting
- Edge cases: missing fields, malformed input
- Security-sensitive paths

### Test types
- Unit tests for all business logic
- Integration tests for all API routes
- DB-backed tests for repository logic
- Serialization/deserialization tests for event payloads
- Container build verification

---

## Observability

- Structured JSON logs from day one
- Request/correlation IDs on every request
- Health endpoint: `GET /health`
- Metrics endpoint: `GET /metrics` (if practical)
- Log all failures with context — never expose secrets in error output

---

## CI/CD

Every change validated before merge. Pipeline must include:
- `cargo fmt --check`
- `cargo clippy -- -D warnings`
- `cargo test`
- `cargo audit`
- Docker build (tests run inside)
- Container image scan if available

All accepted changes pushed to `mf24comet/nectar-poly`.

---

## Frontend Conventions

### Data Fetching
- All server state via TanStack Query — no raw `fetch` in components
- Query hooks live in `src/api/` — one file per backend resource (e.g. `useDevices.ts`, `useAlerts.ts`)
- Mutations use `useMutation` — always invalidate relevant query keys on success
- API base URL from `import.meta.env.VITE_API_URL`

### Tables
- All data tables use TanStack Table
- Server-side pagination, sorting, and filtering for all list endpoints
- Filter state persisted in URL search params

### Components
- Use shadcn/ui primitives as the base for all UI — do not re-implement what shadcn provides
- Always include loading skeletons and empty states for async data
- Always include error states for failed queries
- Components should not know about API URLs — that belongs in query hooks

### TypeScript
- `strict: true` in tsconfig — no exceptions
- Never use `any` — use `unknown` and narrow, or define proper types
- Types in `src/types/` should mirror backend response shapes exactly

### Styling
- Tailwind utility classes only — no inline styles, no CSS modules, no styled-components
- Follow shadcn/ui theming conventions (CSS variables for colors)
- Desktop-first layout — mobile responsiveness is a nice-to-have, not required

### Charts
- All charts use Recharts — do not introduce other charting libraries
- Wrap Recharts components in local wrappers (e.g. `<AreaChart />`) to keep pages clean
- Charts must handle empty/loading states gracefully

---

## Dashboard Requirements

### Page 1: Fleet Overview
- KPI strip: total devices, online/offline, devices needing action, outdated software, critical alerts, affected sites
- Device fleet health: online/offline trend, health by model, error counts by category
- Alert summary: severity distribution, top affected sites/models
- Software compliance summary

### Page 2: Inventory
- Searchable, filterable device table
- Filters: tenant, site, room, subnet, model, software version, status, alert severity
- Export/reporting support
- Device detail drawer: name, status, model, serial, IP/MAC, site/room/subnet/tags, software version, recent alerts, recent logs, last check-in, available remote actions

### Page 3: Alerts & Incidents
- Active alerts list with severity, affected device/site/subnet, first/last seen, aging
- Recurring issues analysis
- Alert drilldown

### Page 4: Software & Lifecycle
- Version distribution by device model
- Devices behind approved baseline
- Rollout progress for updates
- Failed update attempts
- End-of-support watchlist

### Page 5: Utilization
- Device usage trends by day/week/month
- Meeting/call activity trends
- Underused devices
- Busiest rooms/endpoints
- Site comparison view
- SLA tracking: offline rate, alert volume, MTTR, healthy device % over time

---

## Milestones

### Milestone 1: Secure Ingestion MVP
Rust service scaffold, Basic Auth, ingestion endpoint, structured logging, PostgreSQL connection, raw event persistence, tests, Dockerfile, Kubernetes base manifests

### Milestone 2: Core Dashboard APIs
Inventory, alerts, software compliance, drilldown endpoints, filter and pagination support

### Milestone 3: Frontend Dashboard MVP
Fleet Overview, Inventory, Alerts & Incidents, Software & Lifecycle pages

### Milestone 4: Advanced Analytics
Utilization, site/room view, SLA tracking, recurring issue analysis

---

## Working Principles

- Ask for clarification when the optimal solution is not apparent
- Default to Rust for all backend code
- Default to PostgreSQL for all persistence
- Prioritize secure, modular, production-ready design over speed
- Keep all modules under 800 lines — split proactively
- Include tests with all meaningful code changes
- Preserve compatibility with containerized Kubernetes deployment
- Avoid hidden complexity — prefer explicit, readable solutions
- Keep business logic out of route handlers
- All proposed changes must be suitable for committing to `mf24comet/nectar-poly`
