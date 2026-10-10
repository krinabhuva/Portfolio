import Task from '../models/Task.js';
import {
  getFromCache,
  setInCache,
  invalidateCache,
} from '../config/cache.js';
import taskEmitter from '../services/notificationService.js';

/**
 * @desc    Get all tasks (with node-cache: HIT -> return cached, MISS -> query MongoDB & cache)
 * @route   GET /tasks
 * @access  Protected
 */
export const getTasks = async (req, res, next) => {
  try {
    const cacheKey = 'all_tasks';

    // Check cache for key 'all_tasks'
    const cachedTasks = getFromCache(cacheKey);

    // HIT -> Return cached data
    if (cachedTasks !== undefined) {
      return res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully (from cache)',
        data: cachedTasks,
        cache: 'HIT',
      });
    }

    // MISS -> Fetch from MongoDB
    const tasks = await Task.find().sort({ createdAt: -1 });

    // Store fetched result into cache (TTL = 60s)
    setInCache(cacheKey, tasks, 60);

    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
      cache: 'MISS',
    });
  } catch (error) {
    console.error('[TASK CONTROLLER ERROR] getTasks failed:', error.message);
    next(error);
  }
};

/**
 * @desc    Get a single task by ID (with node-cache: task_<id>)
 * @route   GET /tasks/:id
 * @access  Protected
 */
export const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const cacheKey = `task_${taskId}`;

    // Check cache for key 'task_<id>'
    const cachedTask = getFromCache(cacheKey);

    // HIT -> Return cached task
    if (cachedTask !== undefined) {
      return res.status(200).json({
        success: true,
        message: 'Task retrieved successfully (from cache)',
        data: cachedTask,
        cache: 'HIT',
      });
    }

    // MISS -> Fetch from MongoDB
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${taskId}' not found`,
        data: null,
      });
    }

    // Store fetched task into cache (TTL = 60s)
    setInCache(cacheKey, task, 60);

    return res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task,
      cache: 'MISS',
    });
  } catch (error) {
    console.error(`[TASK CONTROLLER ERROR] getTaskById failed for ID '${req.params.id}':`, error.message);
    next(error);
  }
};

/**
 * @desc    Create a new task (Emits task-created event & Invalidates 'all_tasks' cache)
 * @route   POST /tasks
 * @access  Protected
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = new Task({
      title,
      description,
      completed,
      priority,
    });

    const savedTask = await task.save();
    const taskCreationTimestamp = new Date().toISOString();

    // Invalidate 'all_tasks' cache after creating task (Practical 9 Caching)
    invalidateCache('all_tasks');

    // Determine assigned user (from JWT payload req.user or default fallback)
    const assignedUser = req.user ? req.user.email : 'System User';

    // 1. Log event emission
    console.log(`[EVENT EMITTED] 'task-created' event emitted for task "${savedTask.title}" (Assigned: ${assignedUser}) at ${taskCreationTimestamp}`);

    // Capture API response timestamp before sending response
    const apiResponseTimestamp = new Date().toISOString();

    // 2. Emit 'task-created' event to EventEmitter listeners (Handled asynchronously via setImmediate)
    taskEmitter.emit('task-created', {
      taskId: savedTask._id,
      title: savedTask.title,
      description: savedTask.description,
      priority: savedTask.priority,
      assignedUser,
      taskCreationTimestamp,
      apiResponseTimestamp,
    });

    // 3. Log API response
    console.log(`[API RESPONSE SENT] HTTP 201 Created returned immediately for task "${savedTask.title}" at ${apiResponseTimestamp}`);

    // Return response immediately without awaiting notification handling
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask,
    });
  } catch (error) {
    console.error('[TASK CONTROLLER ERROR] createTask failed:', error.message);
    next(error);
  }
};

/**
 * @desc    Update a task by ID (Invalidates 'all_tasks' and 'task_<id>' cache)
 * @route   PUT /tasks/:id
 * @access  Protected
 */
export const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${taskId}' not found`,
        data: null,
      });
    }

    // Invalidate both list cache and single task cache
    invalidateCache(['all_tasks', `task_${taskId}`]);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    console.error(`[TASK CONTROLLER ERROR] updateTask failed for ID '${req.params.id}':`, error.message);
    next(error);
  }
};

/**
 * @desc    Delete a task by ID (Invalidates 'all_tasks' and 'task_<id>' cache)
 * @route   DELETE /tasks/:id
 * @access  Protected
 */
export const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID '${taskId}' not found`,
        data: null,
      });
    }

    // Invalidate both list cache and single task cache
    invalidateCache(['all_tasks', `task_${taskId}`]);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
    });
  } catch (error) {
    console.error(`[TASK CONTROLLER ERROR] deleteTask failed for ID '${req.params.id}':`, error.message);
    next(error);
  }
};
