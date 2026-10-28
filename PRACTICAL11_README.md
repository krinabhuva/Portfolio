# Practical 11: Dockerizing the Task Management Application

A complete, production-ready **Docker multi-container setup** for the full-stack **Task Management Application** built across Practicals 4 to 10 (React/Vite Frontend + Express/Node.js REST API Backend + MongoDB Persistent Database).

---

## 🌟 Key Features & Requirements Implemented

1. **Frontend Containerization (`Dockerfile`)**:
   - Packaged the React + Vite SPA using `node:20-alpine` lightweight base image.
   - Configured Vite dev server with `--host 0.0.0.0 --port 3000` to accept incoming connections across Docker network bridges.
   - Built with `.dockerignore` to prevent copying local `node_modules` into container images.

2. **Backend Containerization (`server/Dockerfile`)**:
   - Packaged the Express + Node.js REST API with `node:20-alpine`.
   - Exposed port `5000` for REST API requests.
   - Retained all JWT authentication, task CRUD endpoints, `node-cache` in-memory caching, and `EventEmitter` non-blocking async notification features.

3. **Database Containerization (`mongo:7.0`)**:
   - Provisioned official MongoDB 7.0 container (`taskmanager-mongo`).
   - Mapped host port `27018:27017` to allow host debugging without port collision against existing local MongoDB instances.
   - Persisted MongoDB data across container restarts and updates using a named volume `mongo_data`.

4. **Multi-Container Orchestration (`docker-compose.yml`)**:
   - Orchestrated `mongo`, `backend`, and `frontend` services using a single declaration file.
   - Configured container-to-container communication using Docker Compose internal DNS service names (`mongo:27017`, `http://backend:5000`).
   - Configured MongoDB URI dynamically using environment variable `MONGO_URI=mongodb://mongo:27017/taskmanager`.

5. **Browser-Accessible Vite API Proxy**:
   - Configured `vite.config.js` with server proxy forwarding `/api/*` to `http://backend:5000/*` via `process.env.VITE_BACKEND_URL`.
   - Updated `src/api.js` to set `BASE_URL` dynamically using `import.meta.env.VITE_API_URL || '/api'`.
   - Resolves browser cross-container CORS issues without hardcoding host IP addresses or `localhost` inside containers.

6. **Health Checks & Dependency Ordering**:
   - Defined database health check using `mongosh --eval "db.adminCommand('ping')"`.
   - Defined backend health check using Node native HTTP fetch on `http://localhost:5000/debug/cache`.
   - Enforced strict container boot ordering (`depends_on: { service_healthy }`).

7. **One-Command Startup**:
   - Entire application stack (Database + API + Web UI) starts with a single command: `docker compose up --build`.

---

## 📂 Project Structure

```
Portfolio/
├── docker-compose.yml           # Root Docker Compose orchestration manifest
├── Dockerfile                   # React + Vite frontend Dockerfile
├── .dockerignore                # Root Docker ignore rules
├── vite.config.js               # Vite config with server host (0.0.0.0) & /api proxy
├── PRACTICAL11_README.md        # Detailed Practical 11 documentation & execution guide
├── PRACTICAL10_README.md        # Node.js EventEmitter async notifications documentation
├── PRACTICAL9_README.md         # In-memory caching & performance benchmark documentation
├── README.md                    # Root portfolio documentation
├── package.json                 # Frontend dependencies & scripts
├── src/                         # React SPA source code
│   ├── api.js                   # Axios client (uses /api base URL with Vite proxy)
│   └── components/
│       └── TaskManager.jsx      # Full-Stack Task Manager component
└── server/                      # Express REST API Backend Directory
    ├── Dockerfile               # Express + Node.js backend Dockerfile
    ├── .dockerignore            # Backend Docker ignore rules
    ├── package.json             # Backend dependencies & test scripts
    ├── server.js                # Express entry point
    ├── config/
    │   ├── db.js                # MongoDB Mongoose connection handler
    │   └── cache.js             # Shared node-cache module
    ├── controllers/             # Task, Auth, & Debug controllers
    ├── middleware/              # Auth & error handling middlewares
    ├── models/                  # Mongoose Task & User schemas
    ├── routes/                  # Express routes (/register, /login, /tasks, /debug)
    ├── services/                # EventEmitter async notification service
    ├── test-practical10.js      # EventEmitter verification test script
    └── test-performance.js      # Caching benchmark test script
```

---

## 🏗️ Multi-Container Architecture & Network Topology

```
                  ┌──────────────────────────────────────────────┐
                  │                 Client Browser               │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTP (Port 3000)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Docker Network Bridge: taskmanager-network                                     │
│                                                                                 │
│   ┌────────────────────────────────────────┐                                   │
│   │ Container: taskmanager-frontend        │                                   │
│   │ (React + Vite Dev Server)              │                                   │
│   │ Host Port: 3000 -> Container Port: 3000│                                   │
│   │ Vite Proxy: /api/*                    │                                   │
│   └───────────────────┬────────────────────┘                                   │
│                       │ Proxy: http://backend:5000                              │
│                       ▼                                                         │
│   ┌────────────────────────────────────────┐                                   │
│   │ Container: taskmanager-backend         │                                   │
│   │ (Express.js REST API + Node-Cache)     │                                   │
│   │ Host Port: 5000 -> Container Port: 5000│                                   │
│   │ ENV: MONGO_URI=mongodb://mongo:27017   │                                   │
│   └───────────────────┬────────────────────┘                                   │
│                       │ Mongoose Connection                                    │
│                       ▼                                                         │
│   ┌────────────────────────────────────────┐      ┌─────────────────────────┐  │
│   │ Container: taskmanager-mongo           │      │ Named Docker Volume     │  │
│   │ (MongoDB 7.0 Database)                 ├─────►│ mongo_data              │  │
│   │ Host Port: 27018 -> Container Port:27017│      │ (Persistent Storage)    │  │
│   └────────────────────────────────────────┘      └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Services & Exposed Host Ports

| Service Name | Container Name | Base Image / Context | Host Port | Container Port | Service Purpose / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mongo` | `taskmanager-mongo` | `mongo:7.0` | `27018` | `27017` | Persistent MongoDB database; health checked via `mongosh`. Host mapped to `27018` to avoid collision with local MongoDB. |
| `backend` | `taskmanager-backend` | `./server` (`node:20-alpine`) | `5000` | `5000` | Node.js + Express REST API; handles Auth, CRUD, Caching, and Async EventEmitter notifications. |
| `frontend` | `taskmanager-frontend` | `.` (`node:20-alpine`) | `3000` | `3000` | React + Vite frontend; proxies `/api` requests to `http://backend:5000`. |

---

## 🛠️ Configuration Files Created / Updated

### 1. Root `docker-compose.yml`
```yaml
name: practical11-taskmanager

services:
  mongo:
    image: mongo:7.0
    container_name: taskmanager-mongo
    restart: unless-stopped
    ports:
      - "27018:27017"
    environment:
      - MONGO_INITDB_DATABASE=taskmanager
    volumes:
      - mongo_data:/data/db
    networks:
      - taskmanager-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: taskmanager-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongo:27017/taskmanager
      - JWT_SECRET=practical11_docker_jwt_secret_key_2026
      - NODE_ENV=production
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - taskmanager-network
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://localhost:5000/debug/cache').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\""]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: taskmanager-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - VITE_BACKEND_URL=http://backend:5000
      - VITE_API_URL=/api
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - taskmanager-network

volumes:
  mongo_data:
    driver: local

networks:
  taskmanager-network:
    driver: bridge
```

### 2. Frontend Dockerfile (`Dockerfile`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
```

### 3. Backend Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000
CMD ["node", "server.js"]
```

### 4. Frontend Vite Proxy Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

---

## 🚀 Build & Execution Commands

### 1. Validate Docker Compose Syntax
```bash
docker compose config
```

### 2. Build and Start All Containers (Foreground)
```bash
docker compose up --build
```

### 3. Build and Start All Containers (Detached Mode)
```bash
docker compose up --build -d
```

### 4. Check Container Health & Status
```bash
docker compose ps
```

### 5. Inspect Live Container Logs
```bash
# View logs from all services
docker compose logs -f

# View logs from backend service only
docker compose logs -f backend
```

### 6. Stop and Remove Containers
```bash
# Stop containers but keep volume data intact
docker compose down

# Stop containers and wipe volume data
docker compose down -v
```

---

## 🧪 Verification Steps & Expected Outputs

### 1. Docker Compose Configuration Validation
Running `docker compose config` parses the specification and confirms valid syntax:
```text
name: practical11-taskmanager
services:
  backend:
    build:
      context: D:\5IT\AWD\Portfolio\server
      dockerfile: Dockerfile
    container_name: taskmanager-backend
    ...
  frontend:
    build:
      context: D:\5IT\AWD\Portfolio
      dockerfile: Dockerfile
    container_name: taskmanager-frontend
    ...
  mongo:
    container_name: taskmanager-mongo
    image: mongo:7.0
    ...
```

### 2. Container Status (`docker compose ps`)
After startup, all 3 containers transition to `running` with health check status `healthy`:
```text
NAME                  IMAGE                   COMMAND                  SERVICE    STATUS
taskmanager-mongo     mongo:7.0               "docker-entrypoint.s…"   mongo      running (healthy)
taskmanager-backend   practical11-backend     "docker-entrypoint.s…"   backend    running (healthy)
taskmanager-frontend  practical11-frontend    "docker-entrypoint.s…"   frontend   running
```

### 3. Backend REST API Endpoint Verification
- **Cache Health Check**:
  - `GET http://localhost:5000/debug/cache`
  - Response: `200 OK` with JSON `{ "success": true, "cacheStats": { "keys": [...], "hits": 0, "misses": 0 } }`
- **Protected Endpoint Check**:
  - `GET http://localhost:5000/tasks`
  - Response: `401 Unauthorized` with JSON `{ "success": false, "message": "Not authorized, token missing" }`

### 4. Backend EventEmitter & Caching Test Suite Verification
Executing verification tests against backend endpoints:
```bash
cd server
npm run test:events
```
Sample Output:
```text
====================================================
  ⚡ Running Practical 10 EventEmitter Verification
====================================================

[MongoDB] Connected: 127.0.0.1/taskmanager
Test verification server running at http://localhost:5003

1. Registering test user (event_user_1791627377605@example.com)...
   Result: SUCCESS - User registered successfully

2. Logging in test user...
   JWT Token Received: YES (Auth Working)

3. Sending POST /tasks to create a task...
[EVENT EMITTED] 'task-created' event emitted for task "Practical 10 Async Event Task" at 2026-10-10T10:16:19.170Z
[API RESPONSE SENT] HTTP 201 Created returned immediately at 2026-10-10T10:16:19.171Z

=================================================
  🔔 ASYNCHRONOUS TASK NOTIFICATION DISPATCHED
=================================================
  📌 Event Name:               'task-created'
  🆔 Task ID:                 6aca1073d902a51fd85ed1c3
  📝 Task Title:              "Practical 10 Async Event Task"
  👤 Assigned User:           event_user_1791627377605@example.com
  🏷️ Task Priority:           high
  ⏰ Handler Execution Time:  2026-10-10T10:16:19.184Z
  📊 Execution Phase:          Asynchronous (setImmediate Check Phase)
  ✅ Status:                   Notification Processed Non-Blockingly
=================================================

====================================================
  ✅ PRACTICAL 10 EVENTEMITTER TEST PASSED!
====================================================
```

---

## 🎯 Conclusion & Key Takeaways

- **Production-Ready Multi-Container Stack**: Dockerized the frontend React SPA, Node.js Express API, and MongoDB into decoupled containers orchestratable with a single command.
- **Port Conflict Protection**: Mapped container ports cleanly (3000, 5000, 27018) avoiding host collisions.
- **Service Name DNS Routing**: Used container service names (`mongo`, `backend`) for container-to-container communication.
- **Vite API Proxying**: Proxying browser API requests (`/api/*` -> `http://backend:5000/*`) guarantees smooth CORS-free browser access.
- **Zero Regression**: Preserved all features from Practicals 4 through 10, including JWT Authentication, Mongoose ODM schemas, node-cache in-memory caching, and asynchronous EventEmitter notifications.
