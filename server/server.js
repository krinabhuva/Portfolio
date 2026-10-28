import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import './services/notificationService.js'; // Initialize EventEmitter async notification listeners

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables explicitly from server/.env (and cwd .env fallback)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Connect to MongoDB Database (only outside test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

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
app.use('/api/ai', aiRoutes); // Practical 13 AI API: POST /api/ai/generate-description
app.use('/ai', aiRoutes); // Practical 13 AI API (Proxy Compatibility): POST /ai/generate-description

// 404 Catch-All Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server (only outside test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  Practical 10 Task Manager API Server Running`);
    console.log(`  Server URL: http://localhost:${PORT}`);
    console.log(`  Auth Routes: POST /register, POST /login, GET /me`);
    console.log(`  Protected Routes: GET/POST /tasks, GET/PUT/DELETE /tasks/:id`);
    console.log(`  AI Route: POST /api/ai/generate-description (OpenAI gpt-4o-mini)`);
    console.log(`  EventEmitter Service: Active ('task-created' listener ready)`);
    console.log(`  Cache Debug Routes: GET /debug/cache, DELETE /debug/cache`);
    console.log(`=================================================`);
  });
}

export default app;
export { app };


