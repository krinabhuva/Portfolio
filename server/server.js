import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import './services/notificationService.js'; // Initialize EventEmitter async notification listeners

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
app.use('/debug', debugRoutes); // Cache Debug & Benchmark Endpoints: GET /debug/cache, DELETE /debug/cache, GET /debug/cache/benchmark

// 404 Catch-All Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Practical 10 Task Manager API Server Running`);
  console.log(`  Server URL: http://localhost:${PORT}`);
  console.log(`  Auth Routes: POST /register, POST /login, GET /me`);
  console.log(`  Protected Routes: GET/POST /tasks, GET/PUT/DELETE /tasks/:id`);
  console.log(`  EventEmitter Service: Active ('task-created' listener ready)`);
  console.log(`  Cache Debug Routes: GET /debug/cache, DELETE /debug/cache`);
  console.log(`=================================================`);
});


