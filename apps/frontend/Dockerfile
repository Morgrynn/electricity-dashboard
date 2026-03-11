FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --frozen-lockfile --filter @app/frontend...
COPY apps/frontend apps/frontend

ARG BUILD_CONFIG=development
RUN cd apps/frontend && ./node_modules/.bin/ng build --configuration=$BUILD_CONFIG

FROM nginx:alpine
COPY apps/frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist/frontend/browser/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
