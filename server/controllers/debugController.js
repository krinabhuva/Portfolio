import { getCacheStats, flushCache, getFromCache, setInCache } from '../config/cache.js';
import Task from '../models/Task.js';

/**
 * @desc    Get cache debug statistics, HIT/MISS counters, and active keys
 * @route   GET /debug/cache
 * @access  Public
 */
export const getDebugCache = (req, res) => {
  try {
    const stats = getCacheStats();
    res.status(200).json({
      success: true,
      message: 'Cache debug statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    console.error('[DEBUG CONTROLLER ERROR] getDebugCache failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache debug statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Flush all cache keys manually
 * @route   DELETE /debug/cache
 * @access  Public
 */
export const clearDebugCache = (req, res) => {
  try {
    flushCache();
    res.status(200).json({
      success: true,
      message: 'Cache flushed successfully',
      data: getCacheStats(),
    });
  } catch (error) {
    console.error('[DEBUG CONTROLLER ERROR] clearDebugCache failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message,
    });
  }
};

/**
 * @desc    Run automated performance benchmark measuring 3 uncached and 3 cached GET /tasks response times
 * @route   GET /debug/cache/benchmark
 * @access  Public
 */
export const runBenchmark = async (req, res) => {
  try {
    const results = {
      uncachedRuns: [],
      cachedRuns: [],
      summary: {},
    };

    // 1. Measure 3 Uncached Requests (MongoDB queries)
    for (let i = 1; i <= 3; i++) {
      flushCache(); // Flush cache to force MISS
      const start = performance.now();
      const tasks = await Task.find().sort({ createdAt: -1 });
      setInCache('all_tasks', tasks, 60);
      const duration = parseFloat((performance.now() - start).toFixed(3));
      results.uncachedRuns.push({ run: i, responseTimeMs: duration, taskCount: tasks.length });
    }

    // 2. Ensure cache is set for cached runs
    const tasks = await Task.find().sort({ createdAt: -1 });
    setInCache('all_tasks', tasks, 60);

    // 3. Measure 3 Cached Requests (Memory lookups)
    for (let i = 1; i <= 3; i++) {
      const start = performance.now();
      const cachedTasks = getFromCache('all_tasks');
      const duration = parseFloat((performance.now() - start).toFixed(3));
      results.cachedRuns.push({ run: i, responseTimeMs: duration, taskCount: cachedTasks ? cachedTasks.length : 0 });
    }

    const avgUncached = (results.uncachedRuns.reduce((sum, r) => sum + r.responseTimeMs, 0) / 3).toFixed(3);
    const avgCached = (results.cachedRuns.reduce((sum, r) => sum + r.responseTimeMs, 0) / 3).toFixed(3);
    const speedup = avgCached > 0 ? (avgUncached / avgCached).toFixed(2) + 'x' : 'N/A';
    const reduction = (((avgUncached - avgCached) / avgUncached) * 100).toFixed(2) + '%';

    results.summary = {
      averageUncachedMs: parseFloat(avgUncached),
      averageCachedMs: parseFloat(avgCached),
      latencyReduction: reduction,
      performanceSpeedup: speedup,
    };

    res.status(200).json({
      success: true,
      message: 'Cache performance benchmark executed successfully',
      data: results,
    });
  } catch (error) {
    console.error('[DEBUG CONTROLLER ERROR] runBenchmark failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to execute cache performance benchmark',
      error: error.message,
    });
  }
};
