FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma
RUN npx prisma generate

FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
