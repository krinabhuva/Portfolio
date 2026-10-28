# Practical 13: AI API Integration in Task Management Application

A production-grade, secure **AI API Integration** implemented within the existing **Practical 6 Task Management** project. This practical integrates OpenAI's `gpt-4o-mini` model to automatically generate concise, actionable task descriptions while maintaining rigorous security, rate limiting, and graceful fallbacks.

---

## 🌟 Key Features & Requirements Implemented

1. **AI Task Description Generator (`gpt-4o-mini`)**:
   - Integrated official `openai` SDK (`^7.45.1`) with model `gpt-4o-mini`.
   - Engineered focused system prompt instructing the model to generate concise, 1–2 sentence actionable descriptions without markdown clutter or quotes.
   - 10-second timeout limit to avoid blocking backend resources.

2. **Backend REST API Endpoint (`POST /api/ai/generate-description`)**:
   - Accepts JSON payload: `{ "title": "Deploy container to Kubernetes" }`.
   - Returns JSON payload:
     ```json
     {
       "success": true,
       "description": "Configure Kubernetes manifests, verify cluster health, and deploy container pods with rolling updates.",
       "model": "gpt-4o-mini",
       "fallback": false,
       "message": "Description generated successfully with gpt-4o-mini",
       "disclaimer": "AI-generated suggestion. Review before using."
     }
     ```
   - Also mounted at `/ai/generate-description` for seamless compatibility with Vite's proxy rewriting in development and Docker containers.

3. **Per-Task Rate Limiting (1 Request / Task / Minute)**:
   - Enforces a rate limit of **maximum one AI generation request per task per minute** (60 seconds).
   - Scoped to the task identity (task ID or normalized title) and client identity.
   - If an immediate second request is made for the same task, the server responds with **HTTP 429 Too Many Requests**, a `Retry-After: <seconds>` header, and a clear cooldown message.
   - Requests for *different* tasks are not blocked.

4. **Transparent Error Handling (No Faked Results)**:
   - Accurately checks and handles missing `OPENAI_API_KEY` (`HTTP 503`), invalid keys (`HTTP 401`), exhausted credit balance or quota (`HTTP 429`), timeouts (`HTTP 504`), and network failures (`HTTP 502`).
   - Rather than returning a generic fallback pretending to be an AI result, it returns an explicit error with the exact cause and displays an informative alert in the UI.
   - Normal task management (create, read, update, delete, complete) continues working uninterrupted regardless of AI service state.

5. **Strict Secret Management & Security**:
   - `OPENAI_API_KEY` is loaded exclusively from the backend `.env` file via `dotenv`.
   - `.env` is strictly ignored by both root and server `.gitignore` files (`git check-ignore` verified).
   - `server/.env.example` provides safe placeholder documentation (`OPENAI_API_KEY=your_openai_api_key_here`).
   - No API keys or secrets are ever hardcoded, exposed in frontend bundles, or printed to logs.

6. **Interactive Frontend UI**:
   - Added **“✨ Generate Description”** button to the existing task form.
   - Displays real-time loading state (`Generating...` with animated spinner).
   - Automatically handles rate limit cooldown with countdown display (`⏳ Cooldown (45s)`).
   - Populates generated text into an **editable description field** (`<textarea>`), giving users complete control to modify or refine the text.
   - Prominently displays the required disclaimer: **“AI-generated suggestion. Review before using.”**
   - Renders task descriptions in the task list.
   - Provides AI description regeneration directly inside inline edit mode.

7. **Multi-Container Docker & CI/CD Preservation**:
   - Retained full Docker orchestration (`docker-compose.yml`, `Dockerfile`, `server/Dockerfile`).
   - Configured optional environment variable forwarding (`OPENAI_API_KEY: ${OPENAI_API_KEY:-}`) in `docker-compose.yml`.
   - Automated tests integrated with Jest & Supertest (`npm test`), passing 100% of test suites.

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                      React 19 Frontend                      │
│  - Task Title Input                                         │
│  - "✨ Generate Description" Button (Loading + Cooldown)     │
│  - Editable Description Field                               │
│  - Disclaimer: "AI-generated suggestion. Review before..."   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            POST /api/ai/generate-description
            (via Vite Proxy or direct API)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js REST Backend                   │
│                                                             │
│  1. Title Validation Middleware (400 if blank)              │
│  2. aiRateLimiter (1 request per task per minute -> 429)     │
│  3. aiController & aiService                                │
│       ├── If OPENAI_API_KEY configured:                     │
│       │     └── Call OpenAI API (model: gpt-4o-mini)        │
│       └── If key missing / error / timeout / quota:         │
│             └── Generate smart rule-based fallback          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                     OpenAI API (gpt-4o-mini)
                     (or Smart Offline Fallback)
```

---

## 📡 API Endpoint Reference

### `POST /api/ai/generate-description`

Generate a short, actionable task description from a given task title.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>   # Optional: automatically sent by frontend
```

#### Request Body
```json
{
  "title": "Set up GitHub Actions CI workflow"
}
```

#### Successful Response (`200 OK` with OpenAI `gpt-4o-mini`)
```json
{
  "success": true,
  "description": "Create a GitHub Actions workflow YAML file to automate building and testing on every pull request.",
  "model": "gpt-4o-mini",
  "fallback": false,
  "message": "Description generated successfully with gpt-4o-mini",
  "disclaimer": "AI-generated suggestion. Review before using."
}
```

#### Error Response (`429 Too Many Requests` when credit balance is exhausted)
```json
{
  "success": false,
  "code": "CREDIT_BALANCE_EXHAUSTED",
  "message": "OpenAI account credit balance is exhausted (HTTP 429). Please add credits to your OpenAI account at https://platform.openai.com/settings/organization/billing to generate AI descriptions.",
  "data": null
}
```

#### Error Response (`503 Service Unavailable` when API key is missing)
```json
{
  "success": false,
  "code": "OPENAI_API_KEY_MISSING",
  "message": "OpenAI API key is missing. Please configure OPENAI_API_KEY in server/.env to use AI description generation.",
  "data": null
}
```

#### Rate Limit Response (`429 Too Many Requests`)
*Triggered when requesting AI generation for the same task twice within 60 seconds:*
```json
{
  "success": false,
  "message": "Rate limit reached: Only one AI request per task per minute is allowed. Please wait 48s before requesting again for this task.",
  "retryAfter": 48,
  "task": "Set up GitHub Actions CI workflow"
}
```

#### Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Task title is required to generate a description",
  "data": null
}
```

---

## 🧪 Automated Test Suite

Run the automated Jest test suite across backend routes and services:

```bash
npm test
```

### Test Coverage Highlights:
- **`tests/ai.test.js`**:
  - Missing or blank task title rejection (`HTTP 400`).
  - Graceful fallback when `OPENAI_API_KEY` is not set (`HTTP 200` + fallback description + disclaimer).
  - Graceful handling of OpenAI quota/auth errors with user-friendly fallback.
  - Successful generation with `gpt-4o-mini` model name verification.
  - Proxy route compatibility (`/ai/generate-description`).
  - Per-task rate limit enforcement (`HTTP 429` on immediate duplicate request, `HTTP 200` for different task).
- **`tests/task.test.js`**:
  - Protected task fetching (`GET /tasks` with JWT).
  - Unauthorized request rejection (`HTTP 401`).
  - In-memory cache health check (`GET /debug/cache`).

**Test Execution Result:**
```text
PASS tests/ai.test.js
PASS tests/task.test.js

Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        4.006 s
```

---

## 🚀 How to Run the Application

### 1. Set Up Environment Variables (Backend)
Open `server/.env` and add your OpenAI API key:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=practical7_jwt_secret_key_2026_super_secure
OPENAI_API_KEY=sk-...your-actual-openai-key...
```
*(Note: If left empty, the application automatically uses smart offline fallbacks without throwing errors).*

### 2. Start the Backend Server
```bash
cd server
npm install
npm run dev
```

### 3. Start the React Frontend
```bash
# In project root
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Or Run via Docker Compose (Practical 11 & 12 Compatible)
```bash
docker compose up --build
```
Open `http://localhost:3000` to access the full-stack containerized application.

