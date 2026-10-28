# Portfolio & Academic Practicals

[![CI/CD Pipeline](https://github.com/krinabhuva/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/krinabhuva/Portfolio/actions/workflows/ci.yml)

Welcome to the **Portfolio & Academic Practicals** repository created by **Krina Bhuva**, built with **React (Vite)**, **Express.js**, and **MongoDB**.

---

## 🚀 Practicals Overview

### 📍 Practical 13: AI API Integration (OpenAI gpt-4o-mini)
- **AI Task Description Generator**: Integrates OpenAI API (`openai`, model `gpt-4o-mini`) to generate concise, actionable task descriptions from task titles.
- **Backend Endpoint**: `POST /api/ai/generate-description` (and `/ai/generate-description` for proxy compatibility) accepting `{ title }` and returning `{ success, description, model, fallback, disclaimer }`.
- **Secret Management**: `OPENAI_API_KEY` stored strictly in backend `.env` (verified in `.gitignore`), never leaked or committed.
- **Per-Task Rate Limiting**: Built-in middleware enforcing maximum 1 AI request per task per minute (HTTP 429 Too Many Requests with `Retry-After` header).
- **Graceful Error Handling & Fallbacks**: Recovers from missing keys, quota limits, timeouts, and network failures with smart rule-based fallback descriptions; normal task CRUD remains 100% operational.
- **Frontend UI**: "✨ Generate Description" button in task form with loading spinner, cooldown timer, editable description field, and visible disclaimer: *"AI-generated suggestion. Review before using."*
- **Automated Tests**: Comprehensive test suite in `server/tests/ai.test.js` validating input validation, gpt-4o-mini generation, rate limiting, and fallback behavior.
- **Documentation**: Detailed guide and API spec available in [`PRACTICAL13_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL13_README.md).

### 📍 Practical 12: CI/CD Pipeline with GitHub Actions
- **Continuous Integration**: Automated CI pipeline defined in `.github/workflows/ci.yml` triggered on every push and pull request to the `main` branch.
- **Automated Testing**: Powered by **Jest** and **Supertest** for testing REST API endpoints (`server/tests/task.test.js`).
- **Endpoint Verification**: Tests `GET /tasks` with valid JWT authentication (HTTP 200 OK), unauthenticated requests (HTTP 401 Unauthorized), and cache health endpoints (`GET /debug/cache`).
- **Database Isolation**: Encapsulated Express app startup without top-level DB connections during tests (`NODE_ENV=test`), allowing tests to run reliably in GitHub Actions without requiring a live MongoDB instance.
- **Commands**: Run tests locally with `npm test` from root or inside the `server/` directory.

### 📍 Practical 11: Multi-Container Dockerization
- **Full-Stack Orchestration**: Multi-container Docker setup orchestrated via `docker-compose.yml`.
- **Services**: `mongo:7.0` (database), `taskmanager-backend` (Node 20 Express API on port 5000), and `taskmanager-frontend` (React + Vite on port 3000).
- **Features**: Isolated bridge network (`taskmanager-network`), persistent named volume (`mongo_data`), container healthchecks, and internal DNS routing (`http://backend:5000`).
- **Documentation**: Detailed architecture available in [`PRACTICAL11_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL11_README.md).

### 📍 Practical 10: Asynchronous Notifications using Node.js EventEmitter
- **Backend**: Native Node.js `EventEmitter` integration (zero third-party packages) with non-blocking `setImmediate()` async notification handling.
- **Features**: Event emission on `POST /tasks`, decoupled async notification execution, immediate HTTP 201 response, timestamp tracking (`taskCreationTimestamp`, `apiResponseTimestamp`, `handlerExecutionTimestamp`), error safety, and automated test script (`npm run test:events`).
- **Documentation**: Detailed guide and event loop architecture available in [`PRACTICAL10_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL10_README.md).

### 📍 Practical 9: In-Memory Caching & Query Optimization
- **Backend**: Express REST API optimized with `node-cache` (TTL = 60s).
- **Features**: Caching layers for `GET /tasks` (`all_tasks`) and `GET /tasks/:id` (`task_<id>`), explicit cache invalidations on `POST`, `PUT`, `DELETE` operations, real-time cache statistics endpoint (`GET /debug/cache`), automated CLI benchmark (`npm run test:cache`), and HTTP benchmark route (`GET /debug/cache/benchmark`).
- **Performance**: Reduced API read response times from **~39 ms (MongoDB query)** to **~1.9 ms (in-memory lookup)**, achieving an **88.6% latency reduction** (8.8x speedup).
- **Documentation**: Comprehensive architecture, cache flow, and benchmark tables available in [`PRACTICAL9_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL9_README.md).

### 📍 Practical 8: React Code-Splitting, Lazy Loading & Suspense
- **Frontend Optimization**: Dynamic route code-splitting implemented using `React.lazy()` and `Suspense` for heavy components (`Projects`, `Contact`, `TaskManager`).
- **Loading State**: Dedicated fallback component (`Loading.jsx` wrapping animated `Spinner`) displayed during asynchronous chunk fetches.
- **Performance Impact**: Reduced initial bundle footprint and critical load time by deferring chunk downloads until user navigation.

### 📍 Practical 7: JWT Authentication & Input Validation
- **Backend**: Express + MongoDB Task Management API upgraded with JWT Bearer Token Authentication, bcryptjs password hashing, route protection middleware (`protect`), input title validation, and profile management (`/me`).
- **Frontend Integration**: Dedicated sign-in and account registration UI in `TaskManager.jsx` with automatic token persistence in localStorage and Axios authorization interceptor.
- **Documentation**: Detailed guide available in [`PRACTICAL7_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL7_README.md).

### 📍 Practical 6: React + Node + MongoDB Task Manager
- **Frontend**: React (Vite, `http://localhost:3000`), Axios, loading & error handling states, auto-dismissing Toast notifications, Delete Confirmation Modal.
- **Backend**: Node.js + Express.js (`http://localhost:5000`), MongoDB + Mongoose ODM, CORS enabled.
- **Features**: Complete CRUD (Create, Read/Filter, Update, Delete) UI, browser refresh persistence via MongoDB.
- **Documentation**: Detailed guide and setup available in [`PRACTICAL6_README.md`](file:///d:/5IT/AWD/Portfolio/PRACTICAL6_README.md).

### 📍 Practical 5: Express REST API with MongoDB & Mongoose
- **Backend**: Express REST API extended with Mongoose ODM for MongoDB storage.
- **Features**: Mongoose Task schema with pre-save title trim, error handling middleware for validation and CastErrors.

### 📍 Practical 4: Node.js & Express RESTful API
- **Backend**: Express REST API baseline with in-memory storage, logging middleware, and custom 404 handler.

### 📍 Practical 3: GitHub REST API Integration & Dynamic UI States
- **Frontend Integration**: Connected React portfolio to live GitHub REST API (`https://api.github.com/users/krinabhuva/repos`).
- **Features**: Asynchronous data fetching in `useEffect`, custom loading spinner (`Spinner.jsx`), error state card with retry button (`ErrorMessage.jsx`), dynamic repository cards with star/fork badges and direct repo links (`RepoCard.jsx`), and real-time client-side search filtering.

### 📍 Practical 2: React State, Controlled Forms & Client-Side Routing
- **Routing**: Multi-page client-side SPA routing with `react-router-dom` (`/`, `/projects`, `/contact`, `*` 404 fallback via `NotFound.jsx`).
- **State Management**: Controlled form implementation in `Contact.jsx` with real-time two-way data binding, live character counter, display preview box, and interactive "Show Help" toggle.
- **Theming**: Dark/Light mode theme toggle using `useState` and `useEffect` with dynamic body class switching.
- **Mobile UX**: Responsive hamburger menu drawer.

### 📍 Practical 1: Personal Portfolio React Application
- **Frontend**: Foundation single-page React portfolio scaffolded with Vite.
- **Architecture**: Modular component hierarchy (`Navbar`, `Header`, `About`, `Skills`, `Projects`, `Footer`) utilizing props for unidirectional data flow.
- **Design System**: Vanilla CSS styling featuring CSS custom properties (tokens), glassmorphism, responsive grid breakpoints, and modern typography.

---

## 🏃 Quick Start Commands

### 1. Run Automated CI Tests (Practical 12)
```bash
# Run from repository root:
npm test

# Or run directly inside the backend:
cd server
npm test
```

### 2. Start Backend Server (`http://localhost:5000`)
```bash
cd server
npm install
npm run dev
```

### 3. Start Frontend Web Application (`http://localhost:3000`)
```bash
npm install
npm run dev
```

Visit `http://localhost:3000/tasks` to view the Task Manager.

### 4. Run Asynchronous Event Notification Test (Practical 10)
```bash
cd server
npm run test:events
```

### 5. Run In-Memory Cache Performance Benchmark (Practical 9)
```bash
cd server
npm run test:cache
```

### 6. Run Full-Stack Docker Containers (Practical 11)
```bash
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend REST API: `http://localhost:5000`
- MongoDB Port: `localhost:27018`

---

## 🔐 Environment Variables

Template files are provided in `server/.env.example`. Create `server/.env` with the following keys (never commit secrets or actual passwords):

| Variable Name | Description | Example Target |
|:---|:---|:---|
| `PORT` | Backend Express HTTP server port | `5000` |
| `MONGO_URI` | MongoDB connection URI string | `mongodb://127.0.0.1:27017/taskmanager` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `your_secret_key` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `VITE_BACKEND_URL` | Vite proxy target URL for Express API in Docker/Dev | `http://localhost:5000` |
| `VITE_API_URL` | Base API URL for frontend Axios requests | `/api` |

---

## 🧪 Practical 12: CI/CD Pipeline Verification Guide

### Continuous Integration Pipeline Architecture
```
[ Developer Git Push (main) ]
               │
               ▼
[ GitHub Actions Runner (Ubuntu) ]
               │
         ┌─────┴────────────────────────┐
         │ 1. actions/checkout@v4       │
         │ 2. actions/setup-node@v4     │
         │ 3. npm ci (in server/)       │
         │ 4. npm test (Jest/Supertest) │
         └─────┬────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
[ Tests Pass ]    [ Tests Fail ]
  Green Check        Red Cross
 (Status: Pass)   (Status: Failed)
```

### Demonstrating a Failed (Red X) vs Successful (Green Check) Pipeline

To demonstrate the CI/CD pipeline in action for academic grading:

#### Step 1: Deliberately Break a Test (Demonstrate Red X)
1. Open [`server/tests/task.test.js`](file:///d:/5IT/AWD/Portfolio/server/tests/task.test.js).
2. On line 49, change the expected status code from `200` to `404`:
   ```javascript
   // Change from:
   expect(response.status).toBe(200);
   // To:
   expect(response.status).toBe(404);
   ```
3. Commit and push the deliberate failure:
   ```bash
   git add server/tests/task.test.js
   git commit -m "test: deliberate failure for CI demonstration"
   git push origin main
   ```
4. Open your GitHub repository in your browser: `https://github.com/krinabhuva/Portfolio/actions`.
5. Observe the workflow run. The pipeline will execute, fail on `npm test`, and display a **Red X** mark.

#### Step 2: Fix the Test (Demonstrate Green Check)
1. Revert line 49 in [`server/tests/task.test.js`](file:///d:/5IT/AWD/Portfolio/server/tests/task.test.js) back to `200`:
   ```javascript
   expect(response.status).toBe(200);
   ```
2. Run `npm test` locally to verify that all tests pass:
   ```bash
   npm test
   ```
3. Commit and push the fix:
   ```bash
   git add server/tests/task.test.js
   git commit -m "fix: restore expected 200 status code for task endpoint test"
   git push origin main
   ```
4. Navigate back to `https://github.com/krinabhuva/Portfolio/actions`.
5. The pipeline triggers automatically, runs all Jest test suites, and displays a **Green Check** mark.

### Screenshot Capture Steps for Academic Submission
1. **GitHub Actions Workflow Runs Page**:
   - Go to `https://github.com/krinabhuva/Portfolio/actions`.
   - Take a screenshot showing the list of workflow runs with the failed run (red cross) followed by the passing run (green check).
2. **Failed Job Detail View**:
   - Click into the failed run, expand the `Run automated Jest & Supertest tests` step.
   - Screenshot showing the Jest assertion failure (`Expected: 404, Received: 200`).
3. **Successful Job Detail View**:
   - Click into the successful run, expand the test execution step.
   - Screenshot showing `PASS tests/task.test.js` with `3 passed, 3 total`.
4. **Repository Homepage Status Badge**:
   - Go to `https://github.com/krinabhuva/Portfolio`.
   - Screenshot the top of the README displaying the active `CI/CD Pipeline: passing` badge.
