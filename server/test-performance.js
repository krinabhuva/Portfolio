import connectDB from './config/db.js';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import { getFromCache, setInCache, flushCache } from './config/cache.js';

dotenv.config();

async function runPerformanceTest() {
  console.log('====================================================');
  console.log('  🚀 Practical 9: In-Memory Cache Performance Test');
  console.log('====================================================\n');

  await connectDB();

  console.log('\n--- 1. Measuring 3 UNCACHED (MongoDB Query / Cache MISS) Requests ---');
  const uncachedTimes = [];

  for (let i = 1; i <= 3; i++) {
    // Flush cache before each uncached run to force cache MISS
    flushCache();
    const startTime = performance.now();
    
    // Simulate database query as done in GET /tasks
    const tasks = await Task.find().sort({ createdAt: -1 });
    // Cache the result as controller does on MISS
    setInCache('all_tasks', tasks, 60);

    const endTime = performance.now();
    const duration = parseFloat((endTime - startTime).toFixed(3));
    uncachedTimes.push(duration);
    console.log(`  Uncached Run #${i}: ${duration} ms (Fetched ${tasks.length} tasks from MongoDB)`);
  }

  console.log('\n--- 2. Measuring 3 CACHED (Memory Lookups / Cache HIT) Requests ---');
  const cachedTimes = [];

  for (let i = 1; i <= 3; i++) {
    const startTime = performance.now();
    
    // Fetch from in-memory cache
    const tasks = getFromCache('all_tasks');

    const endTime = performance.now();
    const duration = parseFloat((endTime - startTime).toFixed(3));
    cachedTimes.push(duration);
    console.log(`  Cached Run #${i}: ${duration} ms (Fetched ${tasks ? tasks.length : 0} tasks from node-cache memory)`);
  }

  // Calculate Averages
  const avgUncached = (uncachedTimes.reduce((a, b) => a + b, 0) / 3).toFixed(3);
  const avgCached = (cachedTimes.reduce((a, b) => a + b, 0) / 3).toFixed(3);
  const speedup = avgCached > 0 ? (avgUncached / avgCached).toFixed(2) : 'N/A';
  const percentageReduction = (((avgUncached - avgCached) / avgUncached) * 100).toFixed(2);

  console.log('\n====================================================');
  console.log('📊 PERFORMANCE RESULTS COMPARISON TABLE');
  console.log('====================================================');
  console.table([
    { Run: 'Run 1', 'Uncached (MongoDB)': `${uncachedTimes[0]} ms`, 'Cached (node-cache)': `${cachedTimes[0]} ms` },
    { Run: 'Run 2', 'Uncached (MongoDB)': `${uncachedTimes[1]} ms`, 'Cached (node-cache)': `${cachedTimes[1]} ms` },
    { Run: 'Run 3', 'Uncached (MongoDB)': `${uncachedTimes[2]} ms`, 'Cached (node-cache)': `${cachedTimes[2]} ms` },
    { Run: 'Average', 'Uncached (MongoDB)': `${avgUncached} ms`, 'Cached (node-cache)': `${avgCached} ms` },
  ]);

  console.log(`\n⚡ Summary:`);
  console.log(`  • Average Uncached Response Time : ${avgUncached} ms`);
  console.log(`  • Average Cached Response Time   : ${avgCached} ms`);
  console.log(`  • Latency Reduction              : ${percentageReduction}% faster`);
  console.log(`  • Performance Speedup            : ${speedup}x speedup\n`);
  console.log('====================================================\n');

  process.exit(0);
}

runPerformanceTest().catch((err) => {
  console.error('Performance test failed:', err);
  process.exit(1);
});
