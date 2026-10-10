# Portfolio & Academic Practicals

Welcome to the **Portfolio & Academic Practicals** repository built with **React (Vite)**, **Express.js**, and **MongoDB**.

---

## 🚀 Practicals Overview

### 📍 Practical 10: Asynchronous Notifications using Node.js EventEmitter
- **Backend**: Native Node.js `EventEmitter` integration (zero third-party packages) with non-blocking `setImmediate()` async notification handling.
- **Features**: Event emission on `POST /tasks`, decoupled async notification execution, immediate HTTP 201 response, timestamp tracking (`taskCreationTimestamp`, `apiResponseTimestamp`, `handlerExecutionTimestamp`), error safety, and automated test script (`npm run test:events`).
- **Documentation**: Detailed guide and event loop architecture available in [`PRACTICAL10_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL10_README.md).

### 📍 Practical 9: In-Memory Caching & Query Optimization
- **Backend**: Express REST API optimized with `node-cache` (TTL = 60s).
- **Features**: Caching layers for `GET /tasks` (`all_tasks`) and `GET /tasks/:id` (`task_<id>`), explicit cache invalidations on `POST`, `PUT`, `DELETE` operations, real-time cache statistics endpoint (`GET /debug/cache`), automated CLI benchmark (`npm run test:cache`), and HTTP benchmark route (`GET /debug/cache/benchmark`).
- **Performance**: Reduced API read response times from **~37.8 ms (MongoDB query)** to **~0.86 ms (in-memory lookup)**, achieving a **97.7% latency reduction** (43.7x speedup).
- **Documentation**: Comprehensive architecture, cache flow, benchmark tables, limitations, and multi-server analysis available in [`PRACTICAL9_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL9_README.md).

### 📍 Practical 7: JWT Authentication & Input Validation
- **Backend**: Express + MongoDB Task Management API upgraded with JWT Bearer Token Authentication, bcryptjs password hashing, route protection middleware (`protect`), input title validation, and profile management (`/me`).
- **Documentation**: Detailed guide available in [`PRACTICAL7_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL7_README.md).

### 📍 Practical 6: React + Node + MongoDB Task Manager
- **Frontend**: React (Vite, `http://localhost:5173`), Axios, loading & error handling states, auto-dismissing Toast notifications, Delete Confirmation Modal.
- **Backend**: Node.js + Express.js (`http://localhost:5000`), MongoDB + Mongoose ODM, CORS enabled.
- **Features**: Complete CRUD (Create, Read/Filter, Update, Delete) UI, browser refresh persistence via MongoDB.
- **Documentation**: Detailed guide and setup available in [`PRACTICAL6_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL6_README.md).

### 📍 Practical 5: Express REST API with MongoDB & Mongoose
- **Backend**: Express REST API extended with Mongoose ODM for MongoDB storage.
- **Features**: Mongoose Task schema with pre-save title trim, error handling middleware for validation and CastErrors.

### 📍 Practical 4: Node.js & Express RESTful API
- **Backend**: Express REST API baseline with in-memory storage, logging middleware, and custom 404 handler.

---

## 🏃 Quick Start Commands

### 1. Start Backend Server (`http://localhost:5000`)
```bash
cd server
npm install
npm run dev
```

### 2. Run Practical 10 EventEmitter Async Notification Test
```bash
cd server
npm run test:events
```

### 3. Run In-Memory Cache Performance Test
```bash
cd server
npm run test:cache
```

### 4. Start Frontend App (`http://localhost:5173`)
```bash
npm install
npm run dev
```

Visit `http://localhost:5173/tasks` to view the Task Manager.
