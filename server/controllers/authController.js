import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper function to generate JWT Token
 * Token expires in 1 hour as required for Practical 7
 */
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
        data: null,
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        data: null,
      });
    }

    // Create new user (password is automatically hashed via pre-save hook in User model)
    const user = await User.create({
      email,
      password,
    });

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

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
        data: null,
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Verify user existence & match password with bcrypt
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    // Generate JWT token (expires in 1 hour)
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

/**
 * @desc    Get logged in user profile using decoded JWT
 * @route   GET /me
 * @access  Private (Protected by JWT Auth Middleware)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is attached by protect auth middleware
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
