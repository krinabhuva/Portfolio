import { useState, useEffect } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getStoredUser,
  getStoredToken,
  loginUser,
  registerUser,
  logoutUser,
} from '../api';
import './TaskManager.css';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // User authentication state (Practical 7 JWT Auth)
  const [currentUser, setCurrentUser] = useState(() => (getStoredToken() ? getStoredUser() : null));
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit task state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, task: null });

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Helper to show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch tasks from Express backend (requires JWT authentication)
  const fetchTasks = async (showLoadingSpinner = true) => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }

    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      const fetchedData = response.data ? response.data : response;
      setTasks(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      const errMsg =
        err.response?.data?.message ||
        'Failed to connect to backend server (localhost:5000). Ensure Express & MongoDB are running.';
      setError(errMsg);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  // Listen for unauthorized events (e.g. expired JWT token)
  useEffect(() => {
    const handleUnauthorized = (e) => {
      setCurrentUser(null);
      setTasks([]);
      const reason = e?.detail || 'Session expired. Please sign in again.';
      showToast(reason, 'error');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Fetch tasks on initial mount if already logged in
  useEffect(() => {
    if (getStoredToken()) {
      fetchTasks(true);
    }
  }, []);

  // Authentication submission handler (Login or Register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrimmed = authEmail.trim();
    if (!emailTrimmed || !authPassword) {
      setAuthError('Please provide both email and password.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        await registerUser({ email: emailTrimmed, password: authPassword });
        showToast('Registration successful! Please sign in with your credentials.', 'success');
        setAuthMode('login');
        setAuthPassword('');
      } else {
        const loginData = await loginUser({ email: emailTrimmed, password: authPassword });
        const user = loginData.user || { email: emailTrimmed };
        setCurrentUser(user);
        showToast(`Signed in successfully as ${user.email}`, 'success');
        setAuthEmail('');
        setAuthPassword('');
        await fetchTasks(true);
      }
    } catch (err) {
      console.error('Auth error:', err);
      const message =
        err.response?.data?.message ||
        'Authentication failed. Please verify credentials and backend connectivity.';
      setAuthError(message);
      showToast(message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setTasks([]);
    setAuthEmail('');
    setAuthPassword('');
    showToast('Signed out successfully.', 'success');
  };

  // Handler: Add a new task (POST /tasks)
  const handleAddTask = async (e) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      showToast('Please enter a task title', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createTask({
        title: trimmedTitle,
        completed: false,
      });

      if (response.success || response.data || response._id) {
        showToast('Task added successfully!', 'success');
        setNewTitle('');
        await fetchTasks(false);
      }
    } catch (err) {
      console.error('Error adding task:', err);
      const errMsg = err.response?.data?.message || 'Failed to create task';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Toggle task completion status (PUT /tasks/:id)
  const handleToggleComplete = async (task) => {
    try {
      const response = await updateTask(task._id, {
        completed: !task.completed,
      });

      if (response.success || response.data || response._id) {
        showToast(
          `Task marked as ${!task.completed ? 'completed' : 'active'}!`,
          'success'
        );
        await fetchTasks(false);
      }
    } catch (err) {
      console.error('Error updating task:', err);
      const errMsg = err.response?.data?.message || 'Failed to update task status';
      showToast(errMsg, 'error');
    }
  };

  // Handler: Save inline edit (PUT /tasks/:id)
  const handleSaveEdit = async (taskId) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      showToast('Task title cannot be empty', 'error');
      return;
    }

    try {
      const response = await updateTask(taskId, {
        title: trimmedTitle,
      });

      if (response.success || response.data || response._id) {
        showToast('Task title updated successfully!', 'success');
        setEditingId(null);
        setEditTitle('');
        await fetchTasks(false);
      }
    } catch (err) {
      console.error('Error editing task:', err);
      const errMsg = err.response?.data?.message || 'Failed to update task title';
      showToast(errMsg, 'error');
    }
  };

  // Handler: Start editing mode
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
  };

  // Handler: Cancel editing mode
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // Handler: Open delete modal
  const promptDeleteTask = (task) => {
    setDeleteModal({ open: true, task });
  };

  // Handler: Confirm deletion (DELETE /tasks/:id)
  const confirmDeleteTask = async () => {
    if (!deleteModal.task) return;
    const taskId = deleteModal.task._id;

    try {
      const response = await deleteTask(taskId);
      if (response.success || response.data || response._id) {
        showToast('Task deleted successfully!', 'success');
        setDeleteModal({ open: false, task: null });
        await fetchTasks(false);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      const errMsg = err.response?.data?.message || 'Failed to delete task';
      showToast(errMsg, 'error');
      setDeleteModal({ open: false, task: null });
    }
  };

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div className="task-manager-container">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-banner toast-${toast.type}`} role="alert">
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : '⚠️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* When user is NOT signed in: Show Practical 7 Authentication Card */}
      {!currentUser && (
        <div className="task-card auth-card">
          <header className="task-header">
            <div className="header-title-wrap">
              <h1 className="task-title">Practical 7: JWT Authentication</h1>
              <span className="badge-tech">Bearer Token Protection</span>
            </div>
            <p className="task-subtitle">
              Task management endpoints are protected by JWT Bearer authentication. Sign in with
              your credentials or create a new account to manage tasks.
            </p>
          </header>

          <div className="auth-tab-buttons">
            <button
              type="button"
              className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
            >
              📝 Create Account
            </button>
          </div>

          {authError && (
            <div className="error-banner auth-error-banner" role="alert">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="task-input auth-input"
                disabled={authLoading}
                autoComplete="email"
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                required
                placeholder="Enter password (min 6 characters)"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="task-input auth-input"
                disabled={authLoading}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button type="submit" className="btn btn-add btn-auth-submit" disabled={authLoading}>
              {authLoading
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In to Task Manager'
                : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {/* When user IS signed in: Show Task Manager CRUD Card */}
      {currentUser && (
        <div className="task-card">
          {/* Active Session Status Bar */}
          <div className="auth-status-bar">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-email">{currentUser.email}</span>
              <span className="auth-badge">JWT Active</span>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Log Out">
              Log Out
            </button>
          </div>

          <header className="task-header">
            <div className="header-title-wrap">
              <h1 className="task-title">Practical 6: Task Manager</h1>
              <span className="badge-tech">React + Express + MongoDB</span>
            </div>
            <p className="task-subtitle">
              Full-Stack REST API CRUD operations with Axios, JWT authentication, and persistent MongoDB storage.
            </p>
          </header>

          {/* Task Counter Statistics */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item active-stat">
              <span className="stat-value">{activeCount}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item completed-stat">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          {/* Add Task Input Form */}
          <form onSubmit={handleAddTask} className="add-task-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="task-input"
                disabled={submitting}
              />
              <button type="submit" className="btn btn-add" disabled={submitting}>
                {submitting ? 'Adding...' : '+ Add Task'}
              </button>
            </div>
          </form>

          {/* Filter Navigation Tabs */}
          <div className="filter-tabs">
            <button
              className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalCount})
            </button>
            <button
              className={`tab-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Pending ({activeCount})
            </button>
            <button
              className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="error-banner" role="alert">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button
                className="btn-retry"
                onClick={() => fetchTasks(true)}
                title="Retry fetching tasks"
              >
                🔄 Retry
              </button>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="task-loading">
              <div className="inline-spinner"></div>
              <span>Connecting to Express backend...</span>
            </div>
          )}

          {/* Task List */}
          {!loading && (
            <ul className="task-list">
              {filteredTasks.length === 0 ? (
                <li className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p className="empty-text">
                    {filter === 'all'
                      ? 'No tasks yet. Add your first task above!'
                      : `No ${filter} tasks found.`}
                  </p>
                </li>
              ) : (
                filteredTasks.map((task) => (
                  <li
                    key={task._id}
                    className={`task-item ${task.completed ? 'completed' : ''}`}
                  >
                    {editingId === task._id ? (
                      // Inline Edit Mode
                      <div className="edit-mode-container">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="edit-input"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(task._id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <div className="edit-actions">
                          <button
                            onClick={() => handleSaveEdit(task._id)}
                            className="btn btn-save"
                            title="Save Changes"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="btn btn-cancel"
                            title="Cancel"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normal Display Mode
                      <>
                        <div className="task-left">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleComplete(task)}
                            />
                            <span className="checkmark"></span>
                          </label>
                          <span
                            className={`task-text ${
                              task.completed ? 'completed-text' : ''
                            }`}
                            onClick={() => handleToggleComplete(task)}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="task-right">
                          <span className={`status-badge ${task.completed ? 'badge-done' : 'badge-pending'}`}>
                            {task.completed ? 'Completed' : 'Pending'}
                          </span>
                          <button
                            onClick={() => startEditing(task)}
                            className="btn btn-icon btn-edit"
                            title="Edit Task"
                            aria-label="Edit Task"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => promptDeleteTask(task)}
                            className="btn btn-icon btn-delete"
                            title="Delete Task"
                            aria-label="Delete Task"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, task: null })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirm Delete</h3>
              <button
                className="modal-close-btn"
                onClick={() => setDeleteModal({ open: false, task: null })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this task?</p>
              {deleteModal.task && (
                <div className="task-preview-box">
                  "{deleteModal.task.title}"
                </div>
              )}
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-cancel"
                onClick={() => setDeleteModal({ open: false, task: null })}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteTask}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
