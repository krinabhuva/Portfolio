import mongoose from 'mongoose';

/**
 * Task Schema Definition for Practical 5
 * Requirements:
 * - title: String, required
 * - description: String
 * - completed: Boolean, default false
 * - createdAt: Date, default Date.now
 * - priority: enum ["low","medium","high"], default "medium"
 * - pre-save hook to trim title
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. Allowed values: low, medium, high',
      },
      default: 'medium',
      lowercase: true,
    },
  },
  {
    versionKey: false,
  }
);

// Pre-save hook to trim title
taskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
