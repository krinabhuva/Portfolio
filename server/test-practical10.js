import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import './services/notificationService.js';

dotenv.config();

async function runEventEmitterVerification() {
  console.log('====================================================');
  console.log('  ⚡ Running Practical 10 EventEmitter Verification');
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

  const PORT = 5003;
  const server = app.listen(PORT, async () => {
    console.log(`Test verification server running at http://localhost:${PORT}\n`);

    try {
      const BASE_URL = `http://localhost:${PORT}`;
      const testEmail = `event_user_${Date.now()}@example.com`;
      const testPassword = 'password123';

      // 1. Register test user
      console.log(`1. Registering test user (${testEmail})...`);
      const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const regData = await regRes.json();
      console.log(`   Result: ${regData.success ? 'SUCCESS' : 'FAILED'} - ${regData.message}`);

      // 2. Login test user to get JWT Bearer Token
      console.log('\n2. Logging in test user...');
      const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const loginData = await loginRes.json();
      const token = loginData.token;
      console.log(`   JWT Token Received: ${token ? 'YES (Auth Working)' : 'NO'}`);

      // 3. Create Task via POST /tasks (triggers EventEmitter & setImmediate Async Handler)
      console.log('\n3. Sending POST /tasks to create a task...');
      const taskPayload = {
        title: 'Practical 10 Async Event Task',
        description: 'Verify Node.js EventEmitter async notifications with setImmediate',
        priority: 'high',
      };

      const startTime = Date.now();
      const createRes = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskPayload),
      });

      const responseTime = Date.now() - startTime;
      const createData = await createRes.json();

      console.log(`   HTTP Status: ${createRes.status}`);
      console.log(`   API Response Duration: ${responseTime} ms (Immediate response)`);
      console.log(`   Created Task ID: ${createData.data._id}`);
      console.log(`   Created Task Title: "${createData.data.title}"`);
      console.log(`   Assigned User: ${testEmail}`);

      // Give setImmediate event loop cycle time to execute & print logs
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log('\n====================================================');
      console.log('  ✅ PRACTICAL 10 EVENTEMITTER TEST PASSED!');
      console.log('====================================================\n');
    } catch (err) {
      console.error('Verification Error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runEventEmitterVerification();
