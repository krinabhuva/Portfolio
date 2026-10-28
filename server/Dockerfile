# ==========================================
# Backend Dockerfile - Express REST API
# Practical 11: Task Management App Dockerization
# ==========================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend package manifests for caching
COPY package.json package-lock.json ./

# Install backend dependencies
RUN npm ci

# Copy backend application source files
COPY . .

# Expose backend port
EXPOSE 5000

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start Express API server
CMD ["node", "server.js"]
