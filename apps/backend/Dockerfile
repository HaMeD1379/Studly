# apps/backend/Dockerfile
# Use a small official node image (change tag if you need Node 22)
FROM node:20-alpine

# Create app dir
WORKDIR /app

# Install build deps first (cacheable)
COPY package*.json ./

# Use a temporary cache location to avoid CI cache-lock issues
RUN npm ci --omit=dev --cache /tmp/.npm-cache

# Copy source
COPY . .

# Expose port (should match PORT env in Railway)
EXPOSE 3000

# Run the app
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
