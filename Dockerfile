# syntax=docker/dockerfile:1
FROM oven/bun:1 AS base

WORKDIR /app


FROM base AS deps

# Prisma config membaca DATABASE_URL saat generate client.
# Nilai ini hanya placeholder untuk install/build stage dan bisa dioverride saat docker build.
ARG DATABASE_URL="mysql://root:root@127.0.0.1:3306/datek"
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lockb ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN bun install --frozen-lockfile \
  && bunx prisma generate


FROM base AS builder

ARG DATABASE_URL="mysql://root:root@127.0.0.1:3306/datek"
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# .next/cache dipertahankan antar-build supaya Next bisa compile inkremental.
RUN --mount=type=cache,target=/app/.next/cache \
  bun run build


FROM base AS prod-deps

ARG DATABASE_URL="mysql://root:root@127.0.0.1:3306/datek"
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lockb ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN bun install --frozen-lockfile --production \
  && bunx prisma generate


FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

# Kepemilikan file diset langsung saat COPY.
#
# Sebelumnya dipakai `chown -R bun:bun /app` setelah semua file disalin. Karena
# chown menyentuh setiap file, seluruh node_modules ditulis ulang jadi satu layer
# baru — terukur 267 detik, hampir separuh waktu build. `COPY --chown` melakukan
# hal yang sama tanpa layer tambahan.
COPY --chown=bun:bun --from=prod-deps /app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /app/.next ./.next
COPY --chown=bun:bun --from=builder /app/public ./public
COPY --chown=bun:bun --from=builder /app/package.json ./package.json
COPY --chown=bun:bun --from=builder /app/next.config.ts ./next.config.ts
COPY --chown=bun:bun --from=builder /app/prisma ./prisma
COPY --chown=bun:bun --from=builder /app/prisma.config.ts ./prisma.config.ts

# Hanya direktori storage yang perlu di-chown, dan isinya kecil.
RUN mkdir -p /app/storage/observer-agent/releases \
  && chown -R bun:bun /app/storage

USER bun

EXPOSE 3001

CMD ["bun", "run", "next", "start", "-H", "0.0.0.0", "-p", "3001"]

