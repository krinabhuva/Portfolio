import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { resetRateLimitStore } from '../middleware/aiRateLimiter.js';
import { resetOpenAIClient, setMockGenerator } from '../services/aiService.js';

describe('Practical 13: AI API Integration Tests', () => {
  beforeEach(() => {
    resetRateLimitStore();
    resetOpenAIClient();
  });

  afterEach(() => {
    resetRateLimitStore();
    resetOpenAIClient();
  });

  describe('POST /api/ai/generate-description - Input Validation', () => {
    it('should return HTTP 400 when task title is missing', async () => {
      const response = await request(app)
        .post('/api/ai/generate-description')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/title is required/i);
    });

    it('should return HTTP 400 when task title is an empty string or whitespace', async () => {
      const response = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/title is required/i);
    });
  });

  describe('POST /api/ai/generate-description - Error Handling (No Fake Fallbacks)', () => {
    it('should return HTTP 503 with a clear error message when OPENAI_API_KEY is not configured', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      resetOpenAIClient();

      const response = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'Build CI/CD pipeline' });

      process.env.OPENAI_API_KEY = originalKey;

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.code).toBe('OPENAI_API_KEY_MISSING');
      expect(response.body.message).toMatch(/OpenAI API key is missing/i);
    });

    it('should return HTTP 429 with clear message when credit balance is exhausted', async () => {
      setMockGenerator(async () => {
        const error = new Error('OpenAI account credit balance is exhausted (HTTP 429). Please add credits to your OpenAI account at https://platform.openai.com/settings/organization/billing to generate AI descriptions.');
        error.statusCode = 429;
        error.code = 'CREDIT_BALANCE_EXHAUSTED';
        throw error;
      });

      const response = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'Fix critical database bug' });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.code).toBe('CREDIT_BALANCE_EXHAUSTED');
      expect(response.body.message).toMatch(/credit balance is exhausted/i);
    });
  });

  describe('POST /api/ai/generate-description - Successful Generation (Mocked gpt-4o-mini)', () => {
    it('should return model gpt-4o-mini and generated description on successful AI call', async () => {
      setMockGenerator(async () => ({
        description: 'Implement automated unit tests with Jest and verify test coverage above 80%.',
        model: 'gpt-4o-mini',
        disclaimer: 'AI-generated suggestion. Review before using.',
      }));

      const response = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'Write unit tests' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.model).toBe('gpt-4o-mini');
      expect(response.body.description).toBe('Implement automated unit tests with Jest and verify test coverage above 80%.');
      expect(response.body.disclaimer).toBe('AI-generated suggestion. Review before using.');
    });

    it('should also work on the proxy-compatible route /ai/generate-description', async () => {
      setMockGenerator(async () => ({
        description: 'Set up Nginx reverse proxy configuration and test SSL termination.',
        model: 'gpt-4o-mini',
        disclaimer: 'AI-generated suggestion. Review before using.',
      }));

      const response = await request(app)
        .post('/ai/generate-description')
        .send({ title: 'Configure Nginx proxy' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('description');
      expect(response.body.disclaimer).toBe('AI-generated suggestion. Review before using.');
    });
  });

  describe('POST /api/ai/generate-description - Rate Limiting (1 request per task per minute)', () => {
    it('should allow the first request, then return HTTP 429 on subsequent requests for the same task within 1 minute', async () => {
      const taskTitle = 'Optimize database queries';

      setMockGenerator(async () => ({
        description: 'Analyze slow query logs, add missing composite indexes, and benchmark execution time.',
        model: 'gpt-4o-mini',
        disclaimer: 'AI-generated suggestion. Review before using.',
      }));

      // First request: should succeed
      const firstResponse = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: taskTitle });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body).toHaveProperty('description');

      // Second immediate request for THE SAME TASK: should be rate-limited (HTTP 429)
      const secondResponse = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: taskTitle });

      expect(secondResponse.status).toBe(429);
      expect(secondResponse.body).toHaveProperty('success', false);
      expect(secondResponse.body.message).toMatch(/rate limit/i);
      expect(secondResponse.headers).toHaveProperty('retry-after');

      // Request for a DIFFERENT task: should succeed immediately (per-task rate limiting)
      const differentTaskResponse = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'Deploy to AWS' });

      expect(differentTaskResponse.status).toBe(200);
      expect(differentTaskResponse.body).toHaveProperty('description');
    });
  });
});
