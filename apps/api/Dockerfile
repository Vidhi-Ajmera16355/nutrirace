# syntax=docker/dockerfile:1
# Build context: repository root.  docker build -f apps/api/Dockerfile .
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile
COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter @nutrirace/shared build \
 && pnpm --filter @nutrirace/api db:generate \
 && pnpm --filter @nutrirace/api build
# Self-contained production tree (workspace deps are copied, not symlinked).
RUN pnpm --filter @nutrirace/api deploy --legacy --prod /out \
 && cp -r apps/api/prisma /out/prisma

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
# Regenerate the Prisma client inside the final tree so it matches the installed packages.
RUN node_modules/.bin/prisma generate --schema prisma/schema.prisma
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
