FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# deps (workspace) 
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter @app/backend...

# build 
FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/backend/node_modules /app/apps/backend/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend apps/backend
RUN pnpm --filter @app/backend build

# prod deps (backend only) 
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --prod --filter @app/backend...

# runner 
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# compiled app
COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/apps/backend/package.json apps/backend/package.json

# runtime deps
COPY --from=prod-deps /app/node_modules node_modules
COPY --from=prod-deps /app/apps/backend/node_modules apps/backend/node_modules

EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
