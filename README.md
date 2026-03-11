# Electricity Dashboard

**Solita Dev Academy Finland – March 2026 Pre-assignment**

This repository contains a full-stack web application for displaying electricity production, consumption, and price data based on the provided Fingrid dataset.

## Architecture overview

Monorepo structure:

```text
electricity-dashboard/
├─ apps/
│  ├─ backend/        # NestJS API
│  ├─ frontend/       # Angular UI
│  └─ e2e/            # Playwright browser E2E
├─ docker-compose.app.yml        # backend only
├─ docker-compose.full.yml       # frontend + backend
├─ docker-compose.linux.yml      # Linux host-gateway override
├─ pnpm-workspace.yaml
├─ package.json
└─ README.md
```

### Stack

- Backend: NestJS + PostgreSQL
- Frontend: Angular
- Browser E2E: Playwright
- Backend HTTP E2E: Jest + supertest
- Package management: pnpm workspaces
- Container runtime: Docker Compose

## Features implemented

### Daily statistics list

- Daily electricity consumption
- Daily electricity production
- Average electricity price
- Longest consecutive negative-price streak per day
- Pagination
- Sorting
- Searching
- Filtering

### Single day view

- Daily summary metrics
- Cheapest hours list
- Max consumption vs production hour
- Hourly price chart
- Hourly consumption vs production chart

### Engineering extras

- Backend Dockerfile
- Full-stack Docker Compose setup
- Health checks
- Swagger / OpenAPI API documentation
- Browser smoke E2E with Playwright
- Backend HTTP E2E with Jest + supertest

## Prerequisites

Required for local development:

- Node.js **20**
- pnpm (via Corepack or installed directly)
- Docker

Check versions:

```bash
node -v
pnpm -v
docker -v
```

## 1) Start the database

The PostgreSQL database is provided separately and is not part of this repository.

Clone and run the provided database repository first:

```bash
git clone https://github.com/solita/dev-academy-spring-2026-exercise.git dev-academy-db
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

### Database connection string

```text
postgres://academy:academy@localhost:5432/electricity
```

## 2) Install dependencies

From the root of this repository:

```bash
corepack enable
pnpm install
cp .env.example .env
```

Example `.env`:

```env
DATABASE_URL=postgres://academy:academy@127.0.0.1:5432/electricity
PORT=3000
```

`127.0.0.1` is used explicitly to avoid localhost IPv6 issues on Linux.

## 3) Run locally

### Backend

```bash
pnpm dev:backend
```

Backend base URL:

- [http://localhost:3000/api](http://localhost:3000/api)

Useful endpoints:

- `GET /api/health`
- `GET /api/meta`
- `GET /api/daily-stats`
- `GET /api/days/:date/summary`
- `GET /api/days/:date/hours`

Swagger / OpenAPI docs:

- [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Examples:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/meta
curl "http://localhost:3000/api/daily-stats?page=1&pageSize=10"
curl http://localhost:3000/api/days/2024-08-24/summary
curl http://localhost:3000/api/days/2024-08-24/hours
```

### Frontend

```bash
pnpm dev:frontend
```

Frontend URL:

- [http://localhost:4200/](http://localhost:4200/)

In development, the Angular proxy forwards `/api/*` to the backend.

## 4) Run backend in Docker

This runs the backend in Docker. The database still comes from the provided database repository.

```bash
docker compose -f docker-compose.app.yml up --build -d
```

Verify:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/meta
```

Swagger docs:

- [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Stop:

```bash
docker compose -f docker-compose.app.yml down
```

### Linux note

The backend container connects to the host database using `host.docker.internal` with Docker’s `host-gateway`.

## 5) Run full stack in Docker

This runs both frontend and backend in Docker. The database still comes from the provided database repository.

### Windows / macOS

```bash
docker compose -f docker-compose.full.yml up --build -d
```

### Linux

```bash
docker compose -f docker-compose.full.yml -f docker-compose.linux.yml up --build -d
```

Verify backend:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/meta
```

Swagger docs:

- [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Open frontend:

- [http://localhost:4200/](http://localhost:4200/)

The nginx frontend container proxies `/api/*` to the backend container.

Stop:

```bash
docker compose -f docker-compose.full.yml down
```

## 6) Testing

### Workspace tests

Run all workspace `test` scripts:

```bash
pnpm test
```

This includes backend and frontend Jest tests.

### Backend HTTP E2E

Run Nest backend E2E tests:

```bash
pnpm test:e2e:backend
```

These tests validate HTTP behavior such as:

- `400 Bad Request` for invalid dates
- `404 Not Found` for missing day data
- `200 OK` for valid hourly endpoint responses

### Browser E2E

Playwright tests live under `apps/e2e`.

Install Playwright browsers once in a fresh environment:

```bash
pnpm --filter @app/e2e exec playwright install
```

Run browser E2E:

```bash
pnpm e2e
```

Ensure the database, backend, and frontend are already running locally or via Docker before running Playwright.

### Full verification

Run the full verification pipeline:

```bash
pnpm verify
```

This runs:

- lint
- workspace tests
- backend E2E
- browser E2E

## 7) Root scripts

Common commands from the repo root:

```bash
pnpm dev:backend        # start backend in watch mode
pnpm dev:frontend       # start frontend dev server
pnpm build              # build all workspaces
pnpm lint               # lint all workspaces
pnpm format             # format repository with Prettier
pnpm test               # workspace tests
pnpm test:e2e:backend   # backend HTTP E2E tests
pnpm e2e                # Playwright browser E2E
pnpm check              # lint + test + build
pnpm verify             # lint + test + backend E2E + browser E2E
```

## 8) API notes

### Daily stats list

The daily list endpoint supports pagination, sorting, searching, and filtering.

### Day summary

`GET /api/days/:date/summary` returns:

- daily total consumption
- daily total production
- average electricity price
- longest negative price streak
- max consumption vs production hour
- cheapest hours

### Hourly series

`GET /api/days/:date/hours` returns hourly records for a single day.

Example response item:

```json
{
  "startTime": "2024-08-24T00:00:00.000Z",
  "consumptionMWh": 3484.187983,
  "productionMWh": 30535.62,
  "priceEurPerMWh": -0.301
}
```

Notes:

- `startTime` is returned as an ISO UTC timestamp
- `consumptionamount` is converted from kWh to MWh
- missing values remain `null`
- records are ordered by `startTime ASC`
- the frontend renders chart hour labels in **Europe/Helsinki** local time

## 9) Manual verification

A simple way to verify hourly data mapping is to compare the API with Adminer for a single row.

Example SQL:

```sql
SELECT
  "date",
  starttime,
  consumptionamount,
  consumptionamount / 1000.0 AS consumption_mwh_converted,
  productionamount,
  hourlyprice
FROM electricitydata
WHERE "date" = DATE '2024-08-24'
  AND starttime = TIMESTAMP '2024-08-24 00:00:00';
```

Compare that with:

```bash
curl http://localhost:3000/api/days/2024-08-24/hours
```

Check that:

- `consumptionamount / 1000.0 = consumptionMWh`
- `productionamount = productionMWh`
- `hourlyprice = priceEurPerMWh`

## 10) Tradeoffs

- SQL is written directly in the repository layer to keep the project simple and readable.
- Shared mapping is used where it helps, but the code is not over-engineered.
- The backend returns UTC times, while the frontend formats them for display.
- Day endpoint validation and error responses are handled explicitly.

## 11) Deployment

The application is deployed to [Render](https://render.com) and publicly accessible:

- **Frontend:** https://electricity-dashboard-frontend.onrender.com
- **Backend:** https://electricity-dashboard-nbkq.onrender.com
- **API docs:** https://electricity-dashboard-nbkq.onrender.com/api/docs

### Services

- **Frontend** — Angular app deployed as a Render Static Site, built with `pnpm --filter @app/frontend build`
- **Backend** — NestJS app deployed as a Render Web Service, built with `pnpm --filter @app/backend build`
- **Database** — PostgreSQL hosted on Render, seeded with the provided Fingrid/porssisahko.net dataset

### Environment-aware API URLs

The Angular app uses environment files to target the correct backend depending on the build configuration:

- **Development** (`environment.ts`) — empty `apiUrl` so the nginx proxy forwards `/api/*` to the local backend container
- **Production** (`environment.prod.ts`) — absolute `apiUrl` pointing to the Render backend

The frontend Dockerfile accepts a `BUILD_CONFIG` build argument (`development` or `production`) so Docker Compose local builds use the development environment while Render builds use the production environment.

## 12) Use of AI tools

Generative AI tools were used in a limited supporting role for reviewing code, refining tests, and drafting documentation. The core design, implementation, debugging, and integration work were completed manually.
