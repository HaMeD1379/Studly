# infra/docker/backend.mem.Dockerfile
# Self-contained backend image with in-memory mock and schema bundled
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Enable in-memory mock by default for self-contained images
ENV STUDLY_USE_MOCK=1

# Install production deps for backend only (context is repo root)
COPY apps/backend/package*.json ./
RUN npm ci --omit=dev --cache /tmp/.npm-cache

# Copy backend source
COPY apps/backend/src ./src

# Bundle mock and schema into predictable absolute paths
COPY infra/docker/mock /infra/docker/mock
COPY infra/docker/db/init /infra/docker/db/init

EXPOSE 3000
CMD ["node", "src/index.js"]

