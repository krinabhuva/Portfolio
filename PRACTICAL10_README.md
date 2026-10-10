# Practical 10: Asynchronous Notifications using Node.js EventEmitter

A full-stack Node.js + Express + MongoDB Task Management API upgraded for **Practical 10** featuring an **Asynchronous Event-Driven Notification System** built with Node.js's native `EventEmitter` and `setImmediate()` non-blocking execution.

---

## 🌟 Key Features Introduced in Practical 10

1. **Native Node.js `EventEmitter` Integration (`services/notificationService.js`)**:
   - Built entirely using Node.js's standard library `events` module — **zero third-party dependencies**.
   - Configured global event error handling (`on('error')`) to prevent uncaught error process crashes.

2. **Asynchronous Non-Blocking Event Listener**:
   - Listens for the `'task-created'` event.
   - Uses **`setImmediate()`** to defer notification processing to the Check phase of the Node.js Event Loop.
   - Ensures that background tasks (such as sending emails, webhook triggers, or push notifications) run asynchronously **without blocking the main thread or delaying the API response**.

3. **Instant HTTP API Response (`POST /tasks`)**:
   - When a user creates a new task via `POST /tasks`, the task is saved to MongoDB, cache invalidation is executed, and the `'task-created'` event is emitted.
   - The Express controller returns an immediate `HTTP 201 Created` JSON response to the client *before* the notification callback finishes executing.

4. **Timestamped Console Audit Trail**:
   - Tracks precise ISO timestamps for:
     1. **Task Creation & Event Emission (`taskCreationTimestamp`)**
     2. **HTTP API Response (`apiResponseTimestamp`)**
     3. **Event Handler Execution (`handlerExecutionTimestamp`)**
   - Demonstrates clear asynchronous sequence execution in terminal logs.

5. **Full Backward Compatibility**:
   - Retains all existing features from Practicals 4 to 9:
     - JWT Bearer Token Authentication & Route Protection (`protect`)
     - MongoDB Mongoose Task & User Models
     - `node-cache` In-Memory Caching & Cache Invalidation
     - Input validation middleware & centralized error handling.

---

## 📂 Project Structure

```
Portfolio/
├── PRACTICAL10_README.md        # Detailed Practical 10 documentation & execution guide
├── PRACTICAL9_README.md         # In-memory caching & performance benchmark documentation
├── README.md                    # Root project summary
├── server/                      # Express Backend Directory (Port 5000)
│   ├── package.json             # Backend scripts ("test:events", "test:cache")
│   ├── server.js                # Express entry point & notification service initialization
│   ├── test-practical10.js      # Practical 10 EventEmitter verification script
│   ├── test-api-verification.js # End-to-end API verification test
│   ├── services/
│   │   └── notificationService.js # Node.js EventEmitter instance & async notification listener
│   ├── config/
│   │   ├── db.js                # MongoDB connection module
│   │   └── cache.js             # Shared node-cache module & statistics tracker
│   ├── controllers/
│   │   ├── taskController.js    # Task CRUD controller with event emission & cache invalidation
│   │   ├── authController.js    # User auth controllers
│   │   └── debugController.js   # Cache debug controllers
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer token protection
│   │   ├── validationMiddleware.js # Task validation middleware
│   │   └── errorHandler.js      # Centralized error handler
│   ├── models/
│   │   ├── User.js              # User model with bcrypt password hashing
│   │   └── Task.js              # Task model
│   └── routes/
│       ├── authRoutes.js        # Auth routes (/register, /login, /me)
│       └── taskRoutes.js        # Task CRUD routes (/tasks)
```

---

## 🔄 Asynchronous Event Loop Architecture

```
  HTTP POST /tasks Request
             │
             ▼
   ┌────────────────────────────────────────┐
   │ 1. Validate Input & Authenticate JWT   │
   └────────────────────┬───────────────────┘
                        │
                        ▼
   ┌────────────────────────────────────────┐
   │ 2. Save Task to MongoDB                │
   └────────────────────┬───────────────────┘
                        │
                        ▼
   ┌────────────────────────────────────────┐
   │ 3. Invalidate 'all_tasks' Cache Key   │
   └────────────────────┬───────────────────┘
                        │
                        ▼
   ┌────────────────────────────────────────┐
   │ 4. Emit 'task-created' Event           │
   │    taskEmitter.emit('task-created')    │
   └────────────────────┬───────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
 (Synchronous Dispatch)      (Deferred via setImmediate)
            │                       │
            ▼                       ▼
┌────────────────────────┐  ┌─────────────────────────────────────────┐
│ 5. Return HTTP Response│  │ Event Loop: Check Phase                 │
│    201 Created Payload │  │ 6. Execute Notification Handler        │
│    (Response Returned  │  │    - Log Task Details                   │
│     Immediately!)      │  │    - Log Execution Timestamp            │
└────────────────────────┘  └─────────────────────────────────────────┘
```

---

## 🛠️ Implementation Highlights

### 1. `server/services/notificationService.js` (EventEmitter Setup)
```javascript
import { EventEmitter } from 'events';

class TaskEventEmitter extends EventEmitter {}
const taskEmitter = new TaskEventEmitter();

// Prevent uncaught errors from crashing Node process
taskEmitter.on('error', (error) => {
  console.error('[EVENT EMITTER ERROR] Caught unhandled event error:', error.message);
});

// Async listener using setImmediate()
taskEmitter.on('task-created', (payload) => {
  setImmediate(() => {
    try {
      const handlerExecutionTimestamp = new Date().toISOString();
      console.log(`[NOTIFICATION HANDLER EXECUTED] Handler Time: ${handlerExecutionTimestamp}`);
      console.log(`Task Title: "${payload.title}" | Assigned User: ${payload.assignedUser}`);
    } catch (err) {
      console.error('[NOTIFICATION ERROR]', err.message);
    }
  });
});

export default taskEmitter;
```

### 2. `server/controllers/taskController.js` (Event Emission)
```javascript
// Inside createTask controller:
const savedTask = await task.save();
const taskCreationTimestamp = new Date().toISOString();

// Cache Invalidation
invalidateCache('all_tasks');

const assignedUser = req.user ? req.user.email : 'System User';

// Emit event non-blockingly
taskEmitter.emit('task-created', {
  taskId: savedTask._id,
  title: savedTask.title,
  description: savedTask.description,
  priority: savedTask.priority,
  assignedUser,
  taskCreationTimestamp,
  apiResponseTimestamp: new Date().toISOString(),
});

// Immediate HTTP API Response
return res.status(201).json({
  success: true,
  message: 'Task created successfully',
  data: savedTask,
});
```

---

## 🧪 How to Run & Verify

### 1. Run Automated Practical 10 Verification Test
Execute the test script directly using npm:
```bash
cd server
npm run test:events
```

### 2. Manual Testing via API Client
1. Start the Express server:
   ```bash
   cd server
   npm run dev
   ```

2. Register & Login to get a JWT token:
   - `POST http://localhost:5000/register` (Body: `{ "email": "user@example.com", "password": "password123" }`)
   - `POST http://localhost:5000/login` (Body: `{ "email": "user@example.com", "password": "password123" }`)

3. Send a `POST` request to `http://localhost:5000/tasks`:
   - **Header**: `Authorization: Bearer <YOUR_JWT_TOKEN>`
   - **Body**:
     ```json
     {
       "title": "Implement Practical 10 Event Notifications",
       "description": "Testing Node.js EventEmitter async notifications",
       "priority": "high"
     }
     ```

4. Observe the terminal logs.

---

## 📊 Sample Execution Output Logs

```text
====================================================
  ⚡ Running Practical 10 EventEmitter Verification
====================================================

[MongoDB] Connected: 127.0.0.1/taskmanager
Test verification server running at http://localhost:5003

1. Registering test user (event_user_1791624895192@example.com)...
   Result: SUCCESS - User registered successfully

2. Logging in test user...
   JWT Token Received: YES (Auth Working)

3. Sending POST /tasks to create a task...
[EVENT EMITTED] 'task-created' event emitted for task "Practical 10 Async Event Task" (Assigned: event_user_1791624895192@example.com) at 2026-10-10T09:34:55.882Z
[API RESPONSE SENT] HTTP 201 Created returned immediately for task "Practical 10 Async Event Task" at 2026-10-10T09:34:55.882Z

=================================================
  🔔 ASYNCHRONOUS TASK NOTIFICATION DISPATCHED
=================================================
  📌 Event Name:               'task-created'
  🆔 Task ID:                 6aca06bf63d5684173adc5d5
  📝 Task Title:              "Practical 10 Async Event Task"
  👤 Assigned User:           event_user_1791624895192@example.com
  🏷️ Task Priority:           high
  ⏱️ Task Creation Time:       2026-10-10T09:34:55.882Z
  🚀 API Response Time:        2026-10-10T09:34:55.882Z
  ⏰ Handler Execution Time:  2026-10-10T09:34:55.884Z
  📊 Execution Phase:          Asynchronous (setImmediate Check Phase)
  ✅ Status:                   Notification Processed Non-Blockingly
=================================================

   HTTP Status: 201
   API Response Duration: 16 ms (Immediate response)
   Created Task ID: 6aca06bf63d5684173adc5d5
   Created Task Title: "Practical 10 Async Event Task"
   Assigned User: event_user_1791624895192@example.com

====================================================
  ✅ PRACTICAL 10 EVENTEMITTER TEST PASSED!
====================================================
```

---

## 🎯 Conclusion & Architectural Benefits

- **Decoupled Architecture**: Event emitters decouple the core business logic (saving a task to the database) from secondary side-effects (sending email notifications, logging analytics, or pushing updates).
- **Reduced Latency**: Offloading side effects to `setImmediate()` ensures API clients experience minimum latency.
- **Zero Third-Party Dependencies**: Built completely using Node.js's standard `events` module.
- **Resilience**: Errors inside async notification handlers are caught and isolated, ensuring server stability and zero impact on client requests.
