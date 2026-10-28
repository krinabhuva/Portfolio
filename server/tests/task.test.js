import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import Task from '../models/Task.js';
import { setInCache, flushCache } from '../config/cache.js';

// Setup consistent JWT Secret for testing environment
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'practical12_ci_test_secret_key';
process.env.JWT_SECRET = TEST_JWT_SECRET;

// Generate valid test JWT Bearer token
const validTestToken = jwt.sign(
  { id: 'student_tester_id_123', email: 'tester@example.com' },
  TEST_JWT_SECRET,
  { expiresIn: '1h' }
);

// Mock task fixture for isolated tests (no live MongoDB required)
const mockTasks = [
  {
    _id: '6ae17b1591dfa10023ea79d1',
    title: 'Practical 12 CI/CD Task',
    description: 'Automated test execution with Jest & Supertest',
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
];

describe('Practical 12: Backend API Automated Tests (CI/CD)', () => {
  let taskFindSpy;

  beforeAll(() => {
    // Mock Mongoose Task.find().sort() to prevent live MongoDB queries in CI runners
    taskFindSpy = jest.spyOn(Task, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockTasks),
    });
  });

  beforeEach(() => {
    // Ensure in-memory cache has mock data loaded before each test
    setInCache('all_tasks', mockTasks, 60);
  });

  afterAll(() => {
    // Clean up mocks and flush cache
    if (taskFindSpy) taskFindSpy.mockRestore();
    flushCache();
  });

  describe('GET /tasks (Task Management Endpoint)', () => {
    it('should return HTTP 200 and task list when authorized with a valid JWT token', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${validTestToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toBe('Practical 12 CI/CD Task');
    });

    it('should return HTTP 401 Unauthorized when Authorization header is missing', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not authorized/i);
    });
  });

  describe('GET /debug/cache (Public Cache Health Endpoint)', () => {
    it('should return HTTP 200 and cache performance statistics', async () => {
      const response = await request(app).get('/debug/cache');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('hits');
      expect(response.body.data).toHaveProperty('misses');
    });
  });
});
