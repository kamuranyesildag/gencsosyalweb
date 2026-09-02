# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev tools like vite, esbuild)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Run the build script defined in package.json
# (vite build && esbuild server.ts ... && esbuild server/migrate.ts ...)
RUN npm run build

# Runtime Stage
FROM node:22-alpine

WORKDIR /app

# Only install production dependencies
# (Needed because esbuild uses --packages=external)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled outputs from the builder stage
COPY --from=builder /app/dist ./dist

# Create the uploads directory for the volume mount and set permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch to the non-root 'node' user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application using the package.json start script
CMD ["npm", "start"]
