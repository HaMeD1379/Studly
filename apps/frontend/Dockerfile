# apps/frontend/Dockerfile
# Build Vite app and serve via NGINX
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Runtime image ---
FROM nginx:1.27-alpine
# SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Vite outDir is configured as 'build' in vite.config.ts
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

