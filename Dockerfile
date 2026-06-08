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

RUN bun run build


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

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p /app/storage/observer-agent/releases \
  && chown -R bun:bun /app

USER bun

EXPOSE 3001

CMD ["bun", "run", "next", "start", "-H", "0.0.0.0", "-p", "3001"]
