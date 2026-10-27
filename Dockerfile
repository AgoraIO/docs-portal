# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv

FROM node:22-bookworm AS dependencies

WORKDIR /app

RUN npm install -g bun@1.3.12

COPY package.json bun.lock ./
COPY patches ./patches
RUN bun install --frozen-lockfile --ignore-scripts

FROM dependencies AS builder

WORKDIR /app

# Git history is mounted only while generating build metadata.
COPY --exclude=.git . .

ARG VITE_DOCS_REGION=global
ARG SITE_URL=
ARG VITE_ALGOLIA_APP_ID=
ARG VITE_ALGOLIA_SEARCH_API_KEY=
ARG VITE_ALGOLIA_INDEX_NAME=
ARG VITE_POSTHOG_KEY=
ARG VITE_POSTHOG_HOST=https://us.i.posthog.com
ARG VITE_DOCS_MEASUREMENT_ENABLED=false
ARG VITE_DOCS_ENVIRONMENT=production
ARG VITE_DOCS_APP_RELEASE=unknown
# The complete docs build needs a container/build agent with at least 4 GiB RAM.
ARG NODE_MAX_OLD_SPACE_SIZE=4096

ENV VITE_DOCS_REGION=${VITE_DOCS_REGION}
ENV SITE_URL=${SITE_URL}
ENV VITE_ALGOLIA_APP_ID=${VITE_ALGOLIA_APP_ID}
ENV VITE_ALGOLIA_SEARCH_API_KEY=${VITE_ALGOLIA_SEARCH_API_KEY}
ENV VITE_ALGOLIA_INDEX_NAME=${VITE_ALGOLIA_INDEX_NAME}
ENV VITE_POSTHOG_KEY=${VITE_POSTHOG_KEY}
ENV VITE_POSTHOG_HOST=${VITE_POSTHOG_HOST}
ENV VITE_DOCS_MEASUREMENT_ENABLED=${VITE_DOCS_MEASUREMENT_ENABLED}
ENV VITE_DOCS_ENVIRONMENT=${VITE_DOCS_ENVIRONMENT}
ENV VITE_DOCS_APP_RELEASE=${VITE_DOCS_APP_RELEASE}
ENV NODE_OPTIONS=--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE}

RUN bun run postinstall
RUN --mount=type=bind,source=.git,target=/app/.git,readonly \
  GIT_CONFIG_COUNT=1 \
  GIT_CONFIG_KEY_0=safe.directory \
  GIT_CONFIG_VALUE_0=/app \
  bun run build

FROM nginx:1.28-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/client /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
