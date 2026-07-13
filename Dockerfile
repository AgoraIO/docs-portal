# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv

FROM oven/bun:1.3.12-alpine AS dependencies

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

FROM dependencies AS builder

WORKDIR /app

COPY . .

ARG VITE_DOCS_REGION=global
ARG SITE_URL=
ARG VITE_ALGOLIA_APP_ID=
ARG VITE_ALGOLIA_SEARCH_API_KEY=
ARG VITE_ALGOLIA_INDEX_NAME=
ARG VITE_POSTHOG_KEY=
ARG VITE_POSTHOG_HOST=https://us.i.posthog.com
# The complete docs build needs a container/build agent with at least 4 GiB RAM.
ARG NODE_MAX_OLD_SPACE_SIZE=1536

ENV VITE_DOCS_REGION=${VITE_DOCS_REGION}
ENV SITE_URL=${SITE_URL}
ENV VITE_ALGOLIA_APP_ID=${VITE_ALGOLIA_APP_ID}
ENV VITE_ALGOLIA_SEARCH_API_KEY=${VITE_ALGOLIA_SEARCH_API_KEY}
ENV VITE_ALGOLIA_INDEX_NAME=${VITE_ALGOLIA_INDEX_NAME}
ENV VITE_POSTHOG_KEY=${VITE_POSTHOG_KEY}
ENV VITE_POSTHOG_HOST=${VITE_POSTHOG_HOST}
ENV NODE_OPTIONS=--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE}

RUN bun run postinstall && bun run build

FROM nginx:1.28-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/client /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
