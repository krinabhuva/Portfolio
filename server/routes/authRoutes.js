import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Auth Routes
router.post('/register', register);
router.post('/login', login);

// Protected User Profile Route
router.get('/me', protect, getMe);

export default router;
