# Stage 1: Build the React + TypeScript application
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Lightweight Node runtime serving static build + /api/progress persistence
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV DATA_DIR=/app/data

# Create persistent volume directory
RUN mkdir -p /app/data

# Copy compiled static frontend and zero-dependency persistence server
COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

VOLUME ["/app/data"]

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/api/progress > /dev/null || exit 1

CMD ["node", "server.mjs"]
