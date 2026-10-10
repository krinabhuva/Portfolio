# Practical 9: In-Memory Caching and Query Optimization

A full-stack Node.js + Express + MongoDB Task Management API upgraded for **Practical 9** featuring **In-Memory Caching** using `node-cache`, automated **Cache Invalidation**, real-time **Cache Statistics (`/debug/cache`)**, and performance response-time benchmarking.

---

## 🌟 Features Introduced in Practical 9

1. **Shared In-Memory Cache Module (`config/cache.js`)**:
   - Configured `node-cache` instance with **TTL (Time-To-Live) = 60 seconds** and cleanup check interval of **120 seconds**.
   - Maintains real-time counters for **Cache HITs** and **Cache MISSes**.
   - Provides reusable helper functions: `getFromCache()`, `setInCache()`, `invalidateCache()`, `flushCache()`, and `getCacheStats()`.

2. **Query Optimization on REST Endpoints**:
   - **`GET /tasks`**: Checks cache key `'all_tasks'`. Returns cached task list immediately on **HIT**. Queries MongoDB, populates cache with TTL=60s, and returns response on **MISS**.
   - **`GET /tasks/:id`**: Checks cache key `'task_<id>'`. Returns cached task object on **HIT**. Queries MongoDB and caches task on **MISS**.

3. **Smart Cache Invalidation Strategy**:
   - **`POST /tasks`**: Automatically invalidates `'all_tasks'` cache to force fresh fetches on subsequent list requests.
   - **`PUT /tasks/:id`**: Invalidates both `'all_tasks'` list cache and specific `'task_<id>'` item cache.
   - **`DELETE /tasks/:id`**: Invalidates both `'all_tasks'` list cache and specific `'task_<id>'` item cache.

4. **Cache Debugging & Monitoring (`GET /debug/cache`)**:
   - Public endpoint returning total requests, hit count, miss count, hit rate percentage, active keys array, and `node-cache` internal stats.
   - Endpoint `DELETE /debug/cache` for manual cache flushing during testing.

5. **Automated Performance Benchmark Script & Endpoint**:
   - **CLI Script**: Run `npm run test:cache` inside `server/` to execute 3 uncached and 3 cached request benchmarks with formatted console output.
   - **API Endpoint**: `GET /debug/cache/benchmark` returns benchmark latency and speedup analysis in JSON format.

---

## 📂 Project Structure

```
Portfolio/
├── server/                      # Express Backend Directory (Port 5000)
│   ├── .env                     # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example             # Template for environment variables
│   ├── package.json             # Backend dependencies & scripts ("test:cache")
│   ├── server.js                # Express entry point & route mounting
│   ├── test-performance.js      # CLI performance benchmarking script
│   ├── test-api-verification.js # End-to-end API verification test
│   ├── config/
│   │   ├── db.js                # Mongoose MongoDB connection module
│   │   └── cache.js             # Shared node-cache module & statistics tracker
│   ├── controllers/
│   │   ├── authController.js    # User auth controllers (register, login, getMe)
│   │   ├── taskController.js    # Task CRUD controllers with caching & invalidation
│   │   └── debugController.js   # Cache debug & benchmarking controllers
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer token protection middleware
│   │   ├── validationMiddleware.js # Task input validation middleware
│   │   └── errorHandler.js      # Centralized error handler
│   ├── models/
│   │   ├── User.js              # User model with bcrypt password hashing
│   │   └── Task.js              # Task model
│   └── routes/
│       ├── authRoutes.js        # Auth routes (/register, /login, /me)
│       ├── taskRoutes.js        # Task CRUD routes (/tasks)
│       └── debugRoutes.js       # Debug routes (/debug/cache, /debug/cache/benchmark)
```

---

## 🔄 Cache Flow Architecture

```
                       ┌─────────────────────────┐
                       │   Incoming HTTP GET     │
                       │     /tasks Request      │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │  Check node-cache Key   │
                       │       'all_tasks'       │
                       └────────────┬────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
          Cache HIT  │                             │ Cache MISS
        (Key Exists) │                             │ (Key Missing/Expired)
                     ▼                             ▼
       ┌───────────────────────────┐  ┌───────────────────────────┐
       │ Return In-Memory Payload  │  │   Query MongoDB Database  │
       │    Latency: ~0.8 - 1.1 ms │  │   Task.find().sort(...)   │
       └───────────────────────────┘  └────────────┬──────────────┘
                                                   │
                                                   ▼
                                      ┌───────────────────────────┐
                                      │ Store Result in Cache     │
                                      │ key: 'all_tasks', TTL=60s │
                                      └────────────┬──────────────┘
                                                   │
                                                   ▼
                                      ┌───────────────────────────┐
                                      │ Return Response to Client │
                                      │   Latency: ~35 - 98 ms    │
                                      └───────────────────────────┘
```

### Write Operations & Invalidation Pipeline:
- **`POST /tasks`**: Save Task to DB ──► `invalidateCache('all_tasks')`
- **`PUT /tasks/:id`**: Update Task in DB ──► `invalidateCache(['all_tasks', 'task_<id>'])`
- **`DELETE /tasks/:id`**: Delete Task from DB ──► `invalidateCache(['all_tasks', 'task_<id>'])`

---

## 📊 Response-Time Comparison Table

The following benchmarks were gathered using `npm run test:cache` comparing 3 uncached (MongoDB query) vs 3 cached (`node-cache` memory lookup) executions:

| Execution Run | Uncached Request (MongoDB Query) | Cached Request (`node-cache` Memory) | Cache Status |
| :--- | :---: | :---: | :---: |
| **Run #1** | `98.61 ms` | `1.10 ms` | `MISS` vs `HIT` |
| **Run #2** | `10.98 ms` | `0.67 ms` | `MISS` vs `HIT` |
| **Run #3** | `3.86 ms` | `0.82 ms` | `MISS` vs `HIT` |
| **Average Response Time** | **`37.82 ms`** | **`0.86 ms`** | — |
| **Performance Gain** | — | **`97.72% Latency Reduction`** | **`43.77x Speedup`** |

> **Key Observation**: Serving read requests from the in-memory cache bypasses MongoDB network serialization, disk I/O, and query parsing overhead, delivering sub-millisecond API response times.

---

## 🛠️ How to Test & Verify

### 1. Run Performance Benchmark Script
```bash
cd server
npm run test:cache
```

### 2. Inspect Debug Statistics Endpoint
Start the server:
```bash
cd server
npm run dev
```

Send a `GET` request to `http://localhost:5000/debug/cache`:
```json
{
  "success": true,
  "message": "Cache debug statistics retrieved successfully",
  "data": {
    "hits": 12,
    "misses": 3,
    "totalRequests": 15,
    "hitRate": "80.00%",
    "keysCount": 2,
    "activeKeys": [
      "all_tasks",
      "task_65f123456789"
    ],
    "ttlSeconds": 60,
    "nodeCacheInternalStats": {
      "hits": 12,
      "misses": 3,
      "keys": 2,
      "ksize": 28,
      "vsize": 450
    }
  }
}
```

### 3. Clear Cache Manually
Send a `DELETE` request to `http://localhost:5000/debug/cache`:
```json
{
  "success": true,
  "message": "Cache flushed successfully",
  "data": {
    "hits": 0,
    "misses": 0,
    "totalRequests": 0,
    "hitRate": "0.00%",
    "keysCount": 0,
    "activeKeys": []
  }
}
```

---

## ⚠️ Cache Limitations

1. **Volatile Memory Storage**:
   - `node-cache` stores data in the Node.js application process memory (V8 Heap).
   - If the Express server restarts, crashes, or redeploys, all cached data is cleared immediately.

2. **Server RAM & Heap Memory Usage**:
   - Cached objects consume server memory. Caching large datasets or millions of key-value pairs can cause high RAM utilization and trigger Out-Of-Memory (OOM) errors.

3. **Stale Data Risks**:
   - If an explicit cache invalidation strategy is missed during a database update or direct MongoDB modification, clients will receive outdated (stale) data until the 60-second TTL expires.

---

## ❌ Why `node-cache` is Unsuitable for Multiple Server Instances

While `node-cache` is fast and lightweight for single-instance applications, it is **unsuitable for multi-instance or load-balanced environments** due to the following architectural reasons:

1. **Process-Bound Storage**:
   - `node-cache` is bound strictly to the heap memory of a single Node.js process.
   - When deploying an app across multiple instances (e.g., via PM2 cluster mode, Docker containers, Kubernetes pods, or AWS EC2 Auto-Scaling behind a Nginx/ALB Load Balancer), **each server instance runs its own isolated in-memory cache**.

2. **Data Inconsistency & Cache Desynchronization**:
   - Suppose Server Instance A receives a `PUT /tasks/123` update request. Instance A updates MongoDB and invalidates `task_123` in *its own* local `node-cache`.
   - However, Server Instance B and Server Instance C still hold the old, stale version of `task_123` in their local memory.
   - Subsequent `GET /tasks/123` requests routed by the load balancer to Instance B or C will return **stale, outdated data** to the user.

3. **Recommended Distributed Solution (Redis / Memcached)**:
   - In a multi-server architecture, a centralized distributed caching layer like **Redis** or **Memcached** should be used.
   - All server instances connect to the centralized Redis instance, ensuring unified cache entries, single-point invalidations, and consistent data across all nodes.

---
