# apps/frontend/Dockerfile
# Build Vite app and serve via NGINX
FROM node:20-alpine AS build
WORKDIR /app

# Accept Vite build-time variables (provided by CI build-args)
ARG VITE_API_BASE_URL
ARG VITE_RAILWAY_API_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_RAILWAY_API_TOKEN=$VITE_RAILWAY_API_TOKEN

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
