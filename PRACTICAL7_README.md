# Practical 7: Express + MongoDB Task Manager with JWT Authentication

A full-stack Node.js + Express + MongoDB Task Management API upgraded for **Practical 7** featuring **JWT Authentication**, password hashing with **bcryptjs**, route protection, input validation, and user profile management (`/me`).

---

## 🌟 Features Added in Practical 7

1. **Authentication & Authorization System**:
   - **`POST /register`**: User registration with automatic `bcryptjs` password hashing (salt rounds: 10).
   - **`POST /login`**: User authentication via `bcrypt.compare` returning a signed JSON Web Token (JWT) with `expiresIn: '1h'`.
   - **`GET /me`**: Protected route returning logged-in user profile details (excluding password) derived from the decoded JWT payload.

2. **Route Protection & Middlewares**:
   - **`authMiddleware.js` (`protect`)**: Inspects `Authorization: Bearer <token>` header, verifies signature with `JWT_SECRET`, attaches `req.user`, and rejects unauthorized/expired requests (`401 Unauthorized`).
   - **`validationMiddleware.js` (`validateTaskTitle`)**: Inspects incoming task creation (`POST /tasks`) and update (`PUT /tasks/:id`) requests, rejecting missing or empty task titles with status `400 Bad Request`.
   - **Protected `/tasks` CRUD Routes**: All `/tasks` endpoints (`GET`, `POST`, `PUT`, `DELETE`) require a valid JWT token.

3. **Environment Security**:
   - Secret key stored securely in `.env` as `JWT_SECRET=practical7_jwt_secret_key_2026_super_secure`.

---

## 📂 Project Structure

```
Portfolio/
├── server/                      # Express Backend Directory (port 5000)
│   ├── .env                     # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example             # Template for environment variables
│   ├── package.json             # Backend dependencies (Express, Mongoose, Cors, Dotenv, Bcryptjs, Jsonwebtoken)
│   ├── server.js                # Express entry point & middleware/route mounting
│   ├── config/
│   │   └── db.js                # Mongoose MongoDB connection module
│   ├── controllers/
│   │   ├── authController.js    # Auth controller functions (register, login, getMe)
│   │   └── taskController.js    # CRUD controller functions (getTasks, createTask, updateTask, deleteTask)
│   ├── middleware/
│   │   ├── authMiddleware.js    # Bearer JWT verification middleware (protect)
│   │   ├── validationMiddleware.js # Task title validation middleware (validateTaskTitle)
│   │   └── errorHandler.js      # 404 & Centralized Error Handler (MongoDB & JWT errors)
│   ├── models/
│   │   ├── User.js              # Mongoose User Schema (email, hashed password, pre-save hook, matchPassword)
│   │   └── Task.js              # Mongoose Task Schema (title, description, completed, priority, createdAt)
│   └── routes/
│       ├── authRoutes.js        # Express Auth routes (/register, /login, /me)
│       └── taskRoutes.js        # Express Task routes (/tasks protected with JWT auth)
```

---

## 📦 Package Installation & Environment Setup

### 1. Installation Commands

Navigate to the `server/` folder and install the required dependencies:

```bash
cd server
npm install bcryptjs jsonwebtoken dotenv express mongoose cors
```

### 2. Environment Configuration (`server/.env`)

Ensure `server/.env` contains the following environment variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=practical7_jwt_secret_key_2026_super_secure
```

`server/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=your_jwt_secret_key_here
```

---

## 🚀 How to Run the Application

### 1. Start MongoDB Server
Ensure your local MongoDB daemon is running locally on port `27017` (or use your MongoDB Atlas / Compass connection string in `.env`).

### 2. Start Backend Server
From the `server` directory:

```bash
# Start server with auto-reload
npm run dev

# Or run using standard Node.js
npm start
```

*Expected Terminal Output:*
```
=================================================
  Practical 7 Task Manager REST API Server Running
  Server URL: http://localhost:5000
  Auth Routes: POST /register, POST /login, GET /me
  Protected Routes: GET/POST /tasks, GET/PUT/DELETE /tasks/:id
=================================================
[MongoDB] Connected: 127.0.0.1/taskmanager
```

---

## 🧪 Postman & cURL Testing Instructions

Follow this step-by-step procedure to test all authentication, validation, and protected routes in Postman or cURL:

### Step 1: Register User (`POST /register`)
- **URL**: `http://localhost:5000/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "email": "student@example.com",
    "password": "secretpassword123"
  }
  ```
- **Expected Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "6a8a9e2b1f3fe30ed1148372",
      "email": "student@example.com",
      "createdAt": "2026-08-23T07:15:55.049Z"
    }
  }
  ```

---

### Step 2: User Login & Obtain JWT Token (`POST /login`)
- **URL**: `http://localhost:5000/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "email": "student@example.com",
    "password": "secretpassword123"
  }
  ```
- **Expected Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "User logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h",
    "data": {
      "_id": "6a8a9e2b1f3fe30ed1148372",
      "email": "student@example.com"
    }
  }
  ```
> 💡 **Copy the `token` string returned in the response for subsequent requests.**

---

### Step 3: Get User Profile (`GET /me`)
- **URL**: `http://localhost:5000/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `Bearer <YOUR_COPIED_JWT_TOKEN>`
- **Expected Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "6a8a9e2b1f3fe30ed1148372",
      "email": "student@example.com",
      "createdAt": "2026-08-23T07:15:55.049Z"
    }
  }
  ```

---

### Step 4: Verify Protection on `/tasks` (Without Token)
- **URL**: `http://localhost:5000/tasks`
- **Method**: `GET`
- **Headers**: *(No Authorization Header)*
- **Expected Response** (`401 Unauthorized`):
  ```json
  {
    "success": false,
    "message": "Not authorized, token missing or invalid format (Bearer token required)",
    "data": null
  }
  ```

---

### Step 5: Test Validation Middleware (`POST /tasks` Without Title)
- **URL**: `http://localhost:5000/tasks`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `Bearer <YOUR_COPIED_JWT_TOKEN>`
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "description": "Task missing title field"
  }
  ```
- **Expected Response** (`400 Bad Request`):
  ```json
  {
    "success": false,
    "message": "Task title is required",
    "data": null
  }
  ```

---

### Step 6: Create Task with Bearer Token (`POST /tasks`)
- **URL**: `http://localhost:5000/tasks`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `Bearer <YOUR_COPIED_JWT_TOKEN>`
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "title": "Complete Practical 7 Express+MongoDB JWT Auth",
    "description": "Implement authentication and protect CRUD routes",
    "priority": "high"
  }
  ```
- **Expected Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "_id": "6a8a9e2b1f3fe30ed1148376",
      "title": "Complete Practical 7 Express+MongoDB JWT Auth",
      "description": "Implement authentication and protect CRUD routes",
      "completed": false,
      "priority": "high",
      "createdAt": "2026-08-23T07:15:55.398Z"
    }
  }
  ```

---

### Step 7: Get All Tasks (`GET /tasks`)
- **URL**: `http://localhost:5000/tasks`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `Bearer <YOUR_COPIED_JWT_TOKEN>`
- **Expected Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": [ ... ]
  }
  ```

---

## 💻 Complete Source Code Files

Below are the complete source code files for the Practical 7 Express + MongoDB Task Manager backend.

### 1. `server/package.json`
```json
{
  "name": "practical7-backend",
  "version": "1.0.0",
  "description": "Task Management REST API with JWT Auth - Express + Node + MongoDB Backend for Practical 7",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^8.5.1"
  }
}
```

### 2. `server/.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=practical7_jwt_secret_key_2026_super_secure
```

### 3. `server/server.js`
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/', authRoutes); // Auth Endpoints: POST /register, POST /login, GET /me
app.use('/tasks', taskRoutes); // Protected REST API Endpoints: /tasks

// 404 Catch-All Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Practical 7 Task Manager REST API Server Running`);
  console.log(`  Server URL: http://localhost:${PORT}`);
  console.log(`  Auth Routes: POST /register, POST /login, GET /me`);
  console.log(`  Protected Routes: GET/POST /tasks, GET/PUT/DELETE /tasks/:id`);
  console.log(`=================================================`);
});
```

### 4. `server/models/User.js`
```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Pre-save hook to hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
```

### 5. `server/models/Task.js`
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
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. Allowed values: low, medium, high',
      },
      default: 'medium',
      lowercase: true,
    },
  },
  {
    versionKey: false,
  }
);

// Pre-save hook to trim title
taskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
```

### 6. `server/middleware/authMiddleware.js`
```javascript
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('[AUTH ERROR]', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
        data: null,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing or invalid format (Bearer token required)',
      data: null,
    });
  }
};
```

### 7. `server/middleware/validationMiddleware.js`
```javascript
export const validateTaskTitle = (req, res, next) => {
  const { title } = req.body;

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
        data: null,
      });
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    if ('title' in req.body && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty',
        data: null,
      });
    }
  }

  next();
};
```

### 8. `server/controllers/authController.js`
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
        data: null,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        data: null,
      });
    }

    const user = await User.create({ email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
        data: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    const token = generateToken(user._id, user.email);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      expiresIn: '1h',
      data: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
```

### 9. `server/controllers/taskController.js`
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

    const task = new Task({
      title,
      description,
      completed,
      priority,
    });

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

### 10. `server/routes/authRoutes.js`
```javascript
import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
```

### 11. `server/routes/taskRoutes.js`
```javascript
import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateTaskTitle } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Protect ALL /tasks CRUD routes with JWT Auth Middleware
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateTaskTitle, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(validateTaskTitle, updateTask)
  .delete(deleteTask);

export default router;
```

### 12. `server/middleware/errorHandler.js`
```javascript
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred';

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `User with this ${field} already exists`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('; ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter '${err.path}': ${err.value}`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    data: null,
  });
};
```
