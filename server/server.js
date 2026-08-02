import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

let tasks = [
  {
    id: 1,
    title: 'Study Node.js REST API Lifecycle',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Implement Express Logging & Error Middleware',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Build Task Management CRUD Endpoints',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];
let nextId = 4;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

const validateContentType = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type header must be application/json',
      });
    }
  }
  next();
};

const validateTaskId = (req, res, next) => {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId) || taskId <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Task ID must be a valid positive integer',
    });
  }
  req.taskId = taskId;
  next();
};

app.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} does not exist`,
    });
  }
  res.status(200).json({
    success: true,
    data: task,
  });
});

app.post('/tasks', validateContentType, (req, res) => {
  const { title, completed } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Task title is required and must be a non-empty string',
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Completed status must be a boolean value',
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: typeof completed === 'boolean' ? completed : false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask,
  });
});

app.put('/tasks/:id', validateTaskId, validateContentType, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} does not exist`,
    });
  }

  const { title, completed } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title must be a non-empty string if provided',
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Completed status must be a boolean value',
    });
  }

  const existingTask = tasks[taskIndex];
  const updatedTask = {
    ...existingTask,
    title: title !== undefined ? title.trim() : existingTask.title,
    completed: typeof completed === 'boolean' ? completed : existingTask.completed,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask,
  });
});

app.delete('/tasks/:id', validateTaskId, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} does not exist`,
    });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: deletedTask,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl} — Route not found`,
  });
});

app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server',
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Task Management REST API running on port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Endpoints: GET/POST /tasks, GET/PUT/DELETE /tasks/:id`);
  console.log(`=================================================`);
});
