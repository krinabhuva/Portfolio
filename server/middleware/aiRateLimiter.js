// In-memory rate limit store: rateLimitKey -> lastRequestTimestamp (ms)
const rateLimitStore = new Map();

// Periodic cleanup to avoid memory accumulation (keys older than 2 minutes cleaned up)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimitStore.entries()) {
    if (now - timestamp > 120000) {
      rateLimitStore.delete(key);
    }
  }
}, 180000);

// Ensure the timer does not prevent process exit in test runners
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

/**
 * Reset rate limit cache (exported for test isolation)
 */
export const resetRateLimitStore = () => {
  rateLimitStore.clear();
};

/**
 * Rate Limiting Middleware: Enforces maximum 1 AI request per task per minute (60 seconds)
 * Practical 13 Requirement: "Add a simple rate limit of one AI request per task per minute."
 */
export const aiRateLimiter = (req, res, next) => {
  const title = req.body?.title;
  const taskId = req.body?.taskId;

  // If title is missing or blank, let controller return 400 Bad Request
  if (!title || typeof title !== 'string' || !title.trim()) {
    return next();
  }

  // Derive unique client identity from authenticated user, IP, or fallback
  const clientKey = req.user?.id || req.user?.email || req.ip || 'anonymous_client';

  // Normalize task identity (taskId if available, otherwise trimmed lowercase title)
  const taskKey = (taskId || title).trim().toLowerCase();
  const rateLimitKey = `${clientKey}:${taskKey}`;

  const now = Date.now();
  const lastRequestTime = rateLimitStore.get(rateLimitKey);
  const COOLDOWN_MS = 60 * 1000; // 60 seconds (1 minute)

  if (lastRequestTime && now - lastRequestTime < COOLDOWN_MS) {
    const elapsed = now - lastRequestTime;
    const remainingSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);

    res.setHeader('Retry-After', remainingSeconds);
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit reached: Only one AI request per task per minute is allowed. Please wait ${remainingSeconds}s before requesting again for this task.`,
      retryAfter: remainingSeconds,
      task: title.trim(),
    });
  }

  // Record timestamp
  rateLimitStore.set(rateLimitKey, now);

  // If the request results in an error (e.g. 401, 503, 429 from OpenAI), remove key
  // so user is not locked out from retrying after fixing credentials or input
  res.on('finish', () => {
    if (res.statusCode >= 400 && res.statusCode !== 429) {
      rateLimitStore.delete(rateLimitKey);
    }
  });

  next();
};
