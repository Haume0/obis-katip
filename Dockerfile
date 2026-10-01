FROM oven/bun:1.4.2 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME="0.0.0.0" \
  NEXT_TELEMETRY_DISABLED=1 \
  DATABASE_URL=file:data/obis.db

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# drizzle-kit migrate ve scripts/hoca-ekle.ts kaynak koddan çalışır; standalone çıktısı
# bunları içermediği için tam node_modules ve gereken kaynaklar ayrıca kopyalanır.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/db ./db
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle.config.ts /app/tsconfig.json ./

# SQLite dosyası burada; kalıcı olması için volume bağlanmalı.
RUN mkdir -p data
VOLUME /app/data

EXPOSE 3000

CMD ["sh", "-c", "bunx drizzle-kit migrate && bun server.js"]
