# ── Stage 1: Dependencies ──
FROM node:22.14.0-alpine3.21 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: Build ──
FROM node:22.14.0-alpine3.21 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 3: Production ──
FROM node:22.14.0-alpine3.21 AS runner
WORKDIR /app

ENV NODE_ENV=production

# non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Next.js build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Custom server + Socket.IO
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/proxy.ts ./proxy.ts

# Prisma (runtime client)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Config files (tsx needs tsconfig)
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

USER nextjs

EXPOSE 8080
ENV PORT=8080

CMD ["npx", "tsx", "server.ts"]
