# Practical 6: React + Node + MongoDB Task Manager

A full-stack, responsive Task Management application built using **React (Vite)** on the frontend (`http://localhost:5173`) and **Express.js + Node.js + MongoDB (Mongoose ODM)** on the backend (`http://localhost:5000`).

---

## 🌟 Key Features

1. **Frontend (React + Vite + Axios @ `http://localhost:5173`)**:
   - **Axios HTTP Client**: Integrated for clean, async CRUD operations with the backend API.
   - **Lifecycle Data Fetching**: Automatically fetches all tasks from MongoDB on component mount (`useEffect`).
   - **Complete CRUD Operations**:
     - **Add Task (POST)**: Form validation, trim whitespace, submit new task to MongoDB.
     - **View/Filter Tasks (GET)**: Interactive statistics bar and filter tabs (**All**, **Pending**, **Completed**).
     - **Toggle Completion (PUT)**: Click checkbox or status badge to toggle completion status.
     - **Inline Title Edit (PUT)**: Edit task titles directly inline with keyboard shortcuts (`Enter` to save, `Esc` to cancel).
     - **Delete Task (DELETE)**: Delete task with confirmation modal.
   - **Delete Confirmation Modal**: Custom glassmorphism modal dialog asking *"Are you sure you want to delete this task?"* before removing records.
   - **Auto-Dismissing Toast System**: Real-time pop-up notification cards for instant success (`✓`) or error (`⚠️`) feedback.
   - **Loading & Error Handling**: Custom CSS spinner during async data fetches and actionable connection error banners if the server is offline.

2. **Backend (Express + Node + MongoDB @ `http://localhost:5000`)**:
   - **REST API Endpoints**: Full GET, POST, PUT, DELETE routes for `/tasks`.
   - **Database Persistence**: MongoDB database (`taskmanager`) via Mongoose ODM. All tasks persist after browser refreshes (`F5`).
   - **CORS Enabled**: Cross-Origin Resource Sharing (`cors()`) enabled for seamless requests from Vite (`localhost:5173`).
   - **Validation & Error Handling**: Mongoose schema validation for required fields, trim pre-hooks, and global error handling middleware.

---

## 📂 Folder Structure

```
Portfolio/
├── index.html
├── package.json                 # Frontend dependencies (React, Vite, Axios, React Router)
├── vite.config.js               # Vite server config (port 5173)
├── README.md                    # Main repository README
├── PRACTICAL6_README.md         # Dedicated Practical 6 documentation
│
├── server/                      # Express Backend Directory (port 5000)
│   ├── .env                     # Environment variables (PORT, MONGO_URI)
│   ├── .env.example             # Template for environment variables
│   ├── package.json             # Backend dependencies (Express, Mongoose, Cors, Dotenv)
│   ├── server.js                # Express entry point & middleware setup
│   ├── config/
│   │   └── db.js                # Mongoose MongoDB connection module
│   ├── controllers/
│   │   └── taskController.js    # CRUD controller functions (getTasks, createTask, updateTask, deleteTask)
│   ├── middleware/
│   │   └── errorHandler.js      # 404 & Centralized Error Handler middleware
│   ├── models/
│   │   └── Task.js              # Mongoose Task Schema (title, completed, createdAt, priority)
│   └── routes/
│       └── taskRoutes.js        # Express REST API routes for /tasks
│
└── src/                         # React Frontend Directory
    ├── App.jsx                  # Main router setup (/tasks route)
    ├── main.jsx                 # React root DOM renderer
    ├── index.css                # Global CSS variables & dark/light theme
    └── components/
        ├── TaskManager.jsx      # Main Practical 6 Task Manager CRUD component
        ├── TaskManager.css      # Styling for Task Manager, Modals, and Toasts
        ├── Navbar.jsx           # Global header navigation with Task Manager link
        └── Projects.jsx         # Portfolio projects showcase
```

---

## 📄 Package Configuration Files

### 1. Frontend `package.json` (Root)

```json
{
  "name": "practical6-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "mongoose": "^9.9.1",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.1"
  },
  "devDependencies": {
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "nodemon": "^3.1.14",
    "oxlint": "^1.71.0",
    "vite": "^8.1.1"
  }
}
```

### 2. Backend `server/package.json`

```json
{
  "name": "practical6-backend",
  "version": "1.0.0",
  "description": "Task Management REST API - Express + MongoDB Backend for Practical 6",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.5.1"
  }
}
```

---

## 💻 Complete Code Implementation

### Backend Code

#### 1. `server/.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
```

#### 2. `server/server.js`
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// REST API Routes
app.use('/tasks', taskRoutes);

// Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Task Manager REST API Server Running`);
  console.log(`  Server URL: http://localhost:${PORT}`);
  console.log(`  Endpoints: GET/POST /tasks, GET/PUT/DELETE /tasks/:id`);
  console.log(`=================================================`);
});
```

#### 3. `server/models/Task.js`
```javascript
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      lowercase: true,
    },
  },
  { versionKey: false }
);

taskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
```

#### 4. `server/routes/taskRoutes.js`
```javascript
import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

export default router;
```

#### 5. `server/controllers/taskController.js`
```javascript
import Task from '../models/Task.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${req.params.id}' not found`,
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = new Task({ title, description, completed, priority });
    const savedTask = await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${req.params.id}' not found`,
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${req.params.id}' not found`,
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Compass / Atlas URI in `server/.env`).

### Step 1: Start Backend Server (`http://localhost:5000`)
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Start Express server with auto-reload
npm run dev
```
*Expected Output:*
```
[MongoDB] Connected: 127.0.0.1/taskmanager
Task Manager REST API Server Running
Server URL: http://localhost:5000
```

### Step 2: Start Frontend App (`http://localhost:5173`)
Open a second terminal window in the project root directory:
```bash
# Install frontend dependencies (including axios)
npm install

# Start Vite React dev server
npm run dev
```
*Expected Output:*
```
VITE v8.1.1  ready in 300 ms
➜  Local:   http://localhost:5173/
```

### Step 3: Open Application in Browser
Open `http://localhost:5173/tasks` in your browser to interact with the Task Manager UI!

---

## 🧪 REST API Endpoints Reference

| Method | Endpoint | Description | Request Body Example |
|---|---|---|---|
| `GET` | `/tasks` | Get all tasks | None |
| `GET` | `/tasks/:id` | Get single task by ID | None |
| `POST` | `/tasks` | Create a new task | `{"title": "Complete Practical 6", "completed": false}` |
| `PUT` | `/tasks/:id` | Update task title or completed status | `{"completed": true}` or `{"title": "Updated Title"}` |
| `DELETE` | `/tasks/:id` | Delete task by ID | None |

### Example cURL Testing Commands

```bash
# 1. Create a Task (POST)
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Build Practical 6 React + Node + MongoDB Task Manager\"}"

# 2. Get All Tasks (GET)
curl http://localhost:5000/tasks

# 3. Update Task Completion (PUT)
curl -X PUT http://localhost:5000/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d "{\"completed\": true}"

# 4. Delete Task (DELETE)
curl -X DELETE http://localhost:5000/tasks/<TASK_ID>
```

---

## 🔄 Proof of Data Persistence

All task data is persistently stored in MongoDB database collection `tasks` inside the `taskmanager` database.

1. **Browser Refresh (`F5`)**: When you refresh the browser page at `http://localhost:5173/tasks`, React runs `useEffect` on mount, triggering an Axios GET request to `http://localhost:5000/tasks`. MongoDB fetches and returns all previously saved tasks.
2. **Server Restart**: Even if you stop and restart the Express backend server or reboot your machine, all tasks remain saved in your local MongoDB database.
