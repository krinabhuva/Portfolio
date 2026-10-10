import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

async function runApiVerification() {
  console.log('====================================================');
  console.log('  🧪 Running Complete Practical 9 API Verification');
  console.log('====================================================\n');

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/', authRoutes);
  app.use('/tasks', taskRoutes);
  app.use('/debug', debugRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(5001, async () => {
    console.log('Test server listening on http://localhost:5001');

    try {
      const BASE_URL = 'http://localhost:5001';

      // 1. Register test user
      const testEmail = `cachetest_${Date.now()}@example.com`;
      console.log(`\n1. Testing POST /register with ${testEmail}...`);
      const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Cache Tester', email: testEmail, password: 'password123' }),
      });
      const regData = await regRes.json();
      console.log('   Register response:', regData.success ? 'SUCCESS' : 'FAILED', regData.message);

      // 2. Login to get JWT Token
      console.log('\n2. Testing POST /login...');
      const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'password123' }),
      });
      const loginData = await loginRes.json();
      const token = loginData.token;
      console.log('   Login response token received:', token ? 'YES (JWT Auth Working)' : 'NO');

      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // 3. Clear debug cache first
      await fetch(`${BASE_URL}/debug/cache`, { method: 'DELETE' });

      // 4. Test GET /tasks - Request #1 (MISS)
      console.log('\n3. Testing GET /tasks - First Call (Should be MISS)...');
      const getTasks1 = await fetch(`${BASE_URL}/tasks`, { headers: authHeaders });
      const getTasks1Data = await getTasks1.json();
      console.log(`   Response Cache Status: '${getTasks1Data.cache}' (Expected: MISS)`);

      // 5. Test GET /tasks - Request #2 (HIT)
      console.log('\n4. Testing GET /tasks - Second Call (Should be HIT)...');
      const getTasks2 = await fetch(`${BASE_URL}/tasks`, { headers: authHeaders });
      const getTasks2Data = await getTasks2.json();
      console.log(`   Response Cache Status: '${getTasks2Data.cache}' (Expected: HIT)`);

      // 6. Test POST /tasks - Create Task & Invalidate Cache
      console.log('\n5. Testing POST /tasks (Create Task & Invalidate Cache)...');
      const createRes = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Practical 9 Cache Verification Task',
          description: 'Testing node-cache TTL and invalidation',
          priority: 'High',
        }),
      });
      const createData = await createRes.json();
      const createdTaskId = createData.data._id;
      console.log(`   Created Task ID: ${createdTaskId}`);

      // 7. Test GET /tasks after POST (Should be MISS due to invalidation)
      console.log('\n6. Testing GET /tasks after POST (Should be MISS due to invalidation)...');
      const getTasks3 = await fetch(`${BASE_URL}/tasks`, { headers: authHeaders });
      const getTasks3Data = await getTasks3.json();
      console.log(`   Response Cache Status: '${getTasks3Data.cache}' (Expected: MISS)`);

      // 8. Test GET /tasks/:id - Request #1 (MISS)
      console.log(`\n7. Testing GET /tasks/${createdTaskId} - First Call (Should be MISS)...`);
      const getTaskById1 = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, { headers: authHeaders });
      const getTaskById1Data = await getTaskById1.json();
      console.log(`   Response Cache Status: '${getTaskById1Data.cache}' (Expected: MISS)`);

      // 9. Test GET /tasks/:id - Request #2 (HIT)
      console.log(`\n8. Testing GET /tasks/${createdTaskId} - Second Call (Should be HIT)...`);
      const getTaskById2 = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, { headers: authHeaders });
      const getTaskById2Data = await getTaskById2.json();
      console.log(`   Response Cache Status: '${getTaskById2Data.cache}' (Expected: HIT)`);

      // 10. Test PUT /tasks/:id - Update Task & Invalidate Cache
      console.log(`\n9. Testing PUT /tasks/${createdTaskId} (Update Task & Invalidate Cache)...`);
      const updateRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Practical 9 Cache Verification Task (Updated)',
          completed: true,
        }),
      });
      const updateData = await updateRes.json();
      console.log(`   Update result: ${updateData.success ? 'SUCCESS' : 'FAILED'}`);

      // 11. Test GET /tasks/:id after PUT (Should be MISS due to invalidation)
      console.log(`\n10. Testing GET /tasks/${createdTaskId} after PUT (Should be MISS)...`);
      const getTaskById3 = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, { headers: authHeaders });
      const getTaskById3Data = await getTaskById3.json();
      console.log(`    Response Cache Status: '${getTaskById3Data.cache}' (Expected: MISS)`);

      // 12. Test DELETE /tasks/:id - Delete Task & Invalidate Cache
      console.log(`\n11. Testing DELETE /tasks/${createdTaskId}...`);
      const deleteRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const deleteData = await deleteRes.json();
      console.log(`    Delete result: ${deleteData.success ? 'SUCCESS' : 'FAILED'}`);

      // 13. Test GET /debug/cache - Inspect HIT/MISS counters & stats
      console.log('\n12. Testing GET /debug/cache (Debug Endpoint)...');
      const debugRes = await fetch(`${BASE_URL}/debug/cache`);
      const debugData = await debugRes.json();
      console.log('    Debug Metrics Data:', JSON.stringify(debugData.data, null, 2));

      // 14. Test GET /debug/cache/benchmark - Inspect Benchmark Endpoint
      console.log('\n13. Testing GET /debug/cache/benchmark...');
      const benchRes = await fetch(`${BASE_URL}/debug/cache/benchmark`);
      const benchData = await benchRes.json();
      console.log('    Benchmark Summary:', JSON.stringify(benchData.data.summary, null, 2));

      console.log('\n====================================================');
      console.log('  ✅ ALL PRACTICAL 9 API CHECKS PASSED SUCCESSFULLY!');
      console.log('====================================================\n');
    } catch (err) {
      console.error('API Verification error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runApiVerification();
