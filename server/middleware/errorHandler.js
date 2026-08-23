/**
 * 404 Not Found Middleware for handling non-existent endpoints
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
};

/**
 * Global Centralized Error Handling Middleware
 * Handles Mongoose ValidationErrors, CastErrors, and general server exceptions
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred';

  // Mongoose Validation Error (e.g., missing title, invalid enum value)
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

  res.status(statusCode).json({
    success: false,
    message: message,
    data: null,
  });
};
