import { EventEmitter } from 'events';

/**
 * Custom EventEmitter for Task Management Application
 * Built using Node.js native 'events' module (no third-party dependencies)
 */
class TaskEventEmitter extends EventEmitter {}

const taskEmitter = new TaskEventEmitter();

// Increase max listeners limit if necessary to prevent memory leak warnings
taskEmitter.setMaxListeners(20);

/**
 * Global Error Listener for EventEmitter
 * Prevents uncaught event errors from crashing the Node.js process
 */
taskEmitter.on('error', (error) => {
  console.error('[EVENT EMITTER ERROR] Caught unhandled event error:', error.message);
});

/**
 * Asynchronous Event Listener for 'task-created' event
 * Uses setImmediate() to defer notification handling to the Check phase of the Event Loop.
 * This guarantees non-blocking execution and allows the HTTP response to be returned immediately.
 */
taskEmitter.on('task-created', (payload) => {
  setImmediate(() => {
    try {
      const handlerExecutionTimestamp = new Date().toISOString();

      console.log(`\n=================================================`);
      console.log(`  🔔 ASYNCHRONOUS TASK NOTIFICATION DISPATCHED`);
      console.log(`=================================================`);
      console.log(`  📌 Event Name:               'task-created'`);
      console.log(`  🆔 Task ID:                 ${payload.taskId}`);
      console.log(`  📝 Task Title:              "${payload.title}"`);
      console.log(`  👤 Assigned User:           ${payload.assignedUser}`);
      console.log(`  🏷️ Task Priority:           ${payload.priority || 'medium'}`);
      console.log(`  ⏱️ Task Creation Time:       ${payload.taskCreationTimestamp}`);
      console.log(`  🚀 API Response Time:        ${payload.apiResponseTimestamp}`);
      console.log(`  ⏰ Handler Execution Time:  ${handlerExecutionTimestamp}`);
      console.log(`  📊 Execution Phase:          Asynchronous (setImmediate Check Phase)`);
      console.log(`  ✅ Status:                   Notification Processed Non-Blockingly`);
      console.log(`=================================================\n`);
    } catch (err) {
      console.error('[NOTIFICATION ERROR] Error executing async task notification handler:', err.message);
    }
  });
});

export default taskEmitter;
