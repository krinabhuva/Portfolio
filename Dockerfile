# ==========================================
# Frontend Dockerfile - React + Vite App
# Practical 11: Task Management App Dockerization
# ==========================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests for efficient layer caching
COPY package.json package-lock.json ./

# Install dependencies (ignoring scripts if needed, clean install)
RUN npm ci

# Copy full application source code
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Set environment variables for external binding
ENV HOST=0.0.0.0
ENV PORT=3000

# Run Vite development server bound to 0.0.0.0:3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
