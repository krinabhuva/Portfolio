import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware to protect routes with JWT Bearer Token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header starting with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded payload (id, email) to req.user
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
