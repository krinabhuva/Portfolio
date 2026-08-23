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

// Route for getting all tasks & creating a task (with title validation)
router.route('/')
  .get(getTasks)
  .post(validateTaskTitle, createTask);

// Route for operations on a single task by ID (with title validation on PUT)
router.route('/:id')
  .get(getTaskById)
  .put(validateTaskTitle, updateTask)
  .delete(deleteTask);

export default router;
