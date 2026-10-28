/**
 * 404 Not Found Middleware for handling non-existent endpoints
 */
export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
};

/**
 * Global Centralized Error Handling Middleware
 * Handles Mongoose ValidationErrors, CastErrors, Duplicate Key Errors, and general server exceptions
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('[GLOBAL ERROR HANDLER]', err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred';

  // Mongoose Duplicate Key Error (e.g., email already registered - code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `User with this ${field} already exists`;
  }

  // Mongoose Validation Error (e.g., missing required fields, invalid enum value)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('; ');
  }

  // Mongoose Cast Error (e.g., invalid ObjectId string)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter '${err.path}': ${err.value}`;
  }

  // JWT Token Invalid or Expired Errors
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
