# Electricity Dashboard

**Solita Dev Academy Finland – March 2026 Pre-assignment**

This repository contains a full-stack web application for displaying electricity
production, consumption, and price data based on the provided Fingrid dataset.

---

## Architecture Overview

**Monorepo structure**

```

electricity-dashboard/
├─ apps/
│  ├─ backend/        # NestJS
│  ├─ frontend/       # Angular
│  └─ e2e/            # Playwright
├─ docker-compose.app.yml        # backend only
├─ docker-compose.full.yml       # frontend + backend
├─ pnpm-workspace.yaml
├─ package.json
└─ README.md

```

## Prerequisites

Required for local development:

- Node.js **20** (LTS)
- pnpm (via Corepack)
- Docker (for containerized workflows)

```bash
node -v
pnpm -v
docker -v
```

---

## 1) Database setup (provided repository)

The PostgreSQL database is **not part of this repository**.

Clone and run the provided DB repository first:

```bash
git clone <PROVIDED_DB_REPOSITORY_URL> dev-academy-db
# or, if you use GitHub CLI:
# gh repo clone <PROVIDED_DB_REPOSITORY_URL> dev-academy-db
cd dev-academy-db
docker compose up --build --renew-anon-volumes -d
```

### Adminer

- URL: [http://localhost:8088/](http://localhost:8088/)
- System: PostgreSQL
- Server: `postgres`
- Username: `academy`
- Password: `academy`
- Database: `electricity`

### Database connection

```
postgres://academy:academy@localhost:5432/electricity
```

---

## 2) Install and configure this repository

From the root of **this** repository:

```bash
pnpm install
cp .env.example .env
```

Example `.env`:

```env
DATABASE_URL=postgres://academy:academy@127.0.0.1:5432/electricity
PORT=3000
```

(IPv4 is used explicitly to avoid localhost IPv6 issues on Linux.)

---

## 3) Run locally (development mode)

### Backend (NestJS)

```bash
pnpm dev:backend
```

Endpoints:

- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- DB meta: [http://localhost:3000/api/meta](http://localhost:3000/api/meta)

---

### Frontend (Angular)

```bash
pnpm dev:frontend
```

- URL: [http://localhost:4200/](http://localhost:4200/)
- Angular dev proxy forwards `/api/*` → backend

---

## 4) Run backend in Docker

Backend only, DB still running from the provided repository.

```bash
docker compose -f docker-compose.app.yml up --build -d
```

Verify:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/meta
```

Stop:

```bash
docker compose -f docker-compose.app.yml down
```

### Linux note

The backend container connects to the host DB via
`host.docker.internal` using Docker’s `host-gateway`.

---

## 5) Run full stack in Docker (frontend + backend)

This runs **frontend (nginx)** and **backend** in Docker.
The database still comes from the provided repository.

Windows / macOS

```bash
docker compose -f docker-compose.full.yml up --build -d
```

Linux

```bash
docker compose -f docker-compose.full.yml -f docker-compose.linux.yml up --build -d
```

Verify backend:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/meta
```

Open frontend:

- [http://localhost:4200/](http://localhost:4200/)

The frontend nginx container proxies `/api/*` to the backend container.

Stop:

```bash
docker compose -f docker-compose.full.yml down
```

---

## 6) End-to-end tests (Playwright)

E2E tests live under `apps/e2e`.

### Install Playwright browsers

```bash
pnpm --filter @app/e2e exec playwright install
```

### Run E2E tests

Ensure DB, backend, and frontend are running (locally **or** via Docker).

Then:

```bash
pnpm e2e
```

The smoke test verifies:

- frontend loads
- backend connectivity works
- DB metadata is rendered

### View Playwright report

```bash
pnpm --filter @app/e2e exec playwright show-report
```

---

## 7) Scripts

Common commands from repo root:

```bash
pnpm dev:backend     # start backend
pnpm dev:frontend    # start frontend
pnpm lint            # lint all workspaces
pnpm format          # format with Prettier
pnpm test            # unit tests
pnpm e2e             # end-to-end tests
pnpm check           # lint + test + build
pnpm verify          # lint + test + e2e
```

---https://github.com/Morgrynn/electricity-dashboard.git
