# Backend Dockerfile - Production Ready
# Multi-stage build for optimized image size

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS deps

WORKDIR /app

# Install dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ============================================
# Stage 2: Production
# ============================================
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hbtrade

# Copy node_modules from deps stage
COPY --from=deps --chown=hbtrade:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=hbtrade:nodejs . .

# Create uploads and logs directories with proper permissions
RUN mkdir -p uploads logs && chown -R hbtrade:nodejs uploads logs

# Switch to non-root user
USER hbtrade

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
