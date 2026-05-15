FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY apps/web/package.json apps/web/
COPY apps/backend/package.json apps/backend/
COPY readonly/ui/package.json readonly/ui/
COPY packages/*/package.json ./packages-meta/
RUN mkdir -p packages/bits packages/boolean packages/design-tokens packages/editor packages/hud packages/sim-engine packages/three-kit
RUN bun install --no-save || true

FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN cd apps/web && bun run build

FROM oven/bun:1.3 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3000
WORKDIR /app/apps/web
CMD ["bun", "run", "start", "--", "-p", "3000", "-H", "0.0.0.0"]
