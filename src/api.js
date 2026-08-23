import axios from 'axios';

// Base API URL for Express + MongoDB backend
export const BASE_URL = 'http://localhost:5000';

// Axios instance configured with base URL and default JSON headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all tasks from MongoDB backend (GET /tasks)
 * @returns {Promise<Object>} API response payload containing tasks array
 */
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

/**
 * Create a new task in MongoDB backend (POST /tasks)
 * @param {Object} taskData - Object containing task properties ({ title, description, completed, priority })
 * @returns {Promise<Object>} API response payload containing created task
 */
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task by ID (PUT /tasks/:id)
 * @param {string} id - Task MongoDB Object ID
 * @param {Object} taskData - Object containing updated fields ({ title, completed, priority, description })
 * @returns {Promise<Object>} API response payload containing updated task
 */
export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task by ID (DELETE /tasks/:id)
 * @param {string} id - Task MongoDB Object ID
 * @returns {Promise<Object>} API response payload containing deleted task summary
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export default api;
