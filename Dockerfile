# Stage 1: Build the React + TypeScript application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source and public data (lapwing-base.json & curriculum.json)
COPY . .

# Compile TypeScript and build production bundle into /app/dist
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:stable-alpine AS runner

# Copy custom Nginx config with Gzip (for 3.3MB lapwing-base.json) & SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
