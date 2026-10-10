import express from 'express';
import { getDebugCache, clearDebugCache, runBenchmark } from '../controllers/debugController.js';

const router = express.Router();

// GET /debug/cache - retrieve cache HIT/MISS counters & active keys
// DELETE /debug/cache - flush all cache entries
router.route('/cache')
  .get(getDebugCache)
  .delete(clearDebugCache);

// GET /debug/cache/benchmark - run response-time comparison benchmark
router.get('/cache/benchmark', runBenchmark);

export default router;
