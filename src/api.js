import axios from 'axios';

// Base API URL for Express + MongoDB backend
// Uses VITE_API_URL environment variable if provided, or defaults to '/api' for Vite proxy in Docker/Dev
export const BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '/api';

// Storage key constants
const TOKEN_KEY = 'portfolio_jwt_token';
const USER_KEY = 'portfolio_auth_user';

// Token and User persistence helpers
export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to persist token:', err);
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.error('Failed to persist user profile:', err);
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth state:', err);
  }
};

// Axios instance configured with base URL and default JSON headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if user is authenticated
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Detect 401 Unauthorized, clear stale token, and broadcast event
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: error.response?.data?.message || 'Session expired or not authorized',
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

// ——— Authentication API Methods (Practical 7) ———

/**
 * Register a new user (POST /register)
 * @param {Object} userData - { email, password }
 */
export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

/**
 * Log in an existing user (POST /login)
 * Automatically persists JWT token on success
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/login', credentials);
  if (response.data && response.data.token) {
    setStoredToken(response.data.token);
    if (response.data.user) {
      setStoredUser(response.data.user);
    }
  }
  return response.data;
};

/**
 * Log out user by clearing credentials
 */
export const logoutUser = () => {
  clearAuth();
};

/**
 * Get current user profile (GET /me)
 */
export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};

// ——— Task CRUD API Methods (Practical 6) ———

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

// ——— AI API Methods (Practical 13) ———

/**
 * Generate AI task description using OpenAI gpt-4o-mini (POST /ai/generate-description)
 * @param {string} title - Task title to generate description for
 * @param {string} [taskId] - Optional Task ID for existing tasks
 * @returns {Promise<Object>} API response payload containing { success, description, fallback, message, disclaimer }
 */
export const generateTaskDescription = async (title, taskId = null) => {
  const payload = { title: title.trim() };
  if (taskId) payload.taskId = taskId;
  const response = await api.post('/ai/generate-description', payload);
  return response.data;
};

export default api;
