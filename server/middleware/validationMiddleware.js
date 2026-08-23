/**
 * Validation Middleware to reject requests with missing or empty task title
 * - On POST /tasks: rejects missing or blank title (400 Bad Request)
 * - On PUT /tasks/:id: rejects empty title string if title is being updated
 */
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
