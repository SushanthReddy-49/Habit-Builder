import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { categorizeTask } from '../services/gemini.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/tasks
// @desc    Add a new task with AI categorization
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('description').optional().trim(),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date } = req.body;
    const userId = req.user._id;

    // Get user's current category points
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Categorize task using OpenAI
    const categorization = await categorizeTask(title, description);
    
    // Get points for the category
    const points = user.categoryPoints[categorization.category];

    // Create new task
    // Ensure date is properly handled to avoid timezone issues
    let taskDate;
    if (date) {
      // Parse the date string and set it to the start of the day in local timezone
      const [year, month, day] = date.split('-').map(Number);
      taskDate = new Date(year, month - 1, day); // month is 0-indexed
      console.log('Creating task with date:', date, 'parsed as:', taskDate);
    } else {
      taskDate = new Date();
      console.log('Creating task with current date:', taskDate);
    }
    
    const task = new Task({
      user: userId,
      title,
      description,
      category: categorization.category,
      points,
      date: taskDate,
      aiConfidence: categorization.confidence
    });

    await task.save();

    // Update user's weekly stats
    user.weeklyStats[categorization.category].total += 1;
    await user.save();

    res.status(201).json({
      task,
      categorization: {
        category: categorization.category,
        confidence: categorization.confidence
      }
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: 'Server error while adding task' });
  }
});

// @route   GET /api/tasks
// @desc    Get tasks for a specific date
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user._id;

    // Use the same date parsing logic as task creation to ensure consistency
    let targetDate;
    if (date) {
      // Parse the date string and set it to the start of the day in local timezone
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      targetDate = new Date();
    }
    
    console.log('Fetching tasks for date:', date, 'parsed as:', targetDate);
    const tasks = await Task.getTasksByDate(userId, targetDate);
    console.log('Found', tasks.length, 'tasks for date:', date);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
});

// @route   GET /api/tasks/review
// @desc    Get pending tasks for review (yesterday's tasks)
// @access  Private
router.get('/review', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get yesterday's date - ensure it's set to start of day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const pendingTasks = await Task.getPendingReview(userId, yesterday);
    
    res.json(pendingTasks);
  } catch (error) {
    console.error('Get review tasks error:', error);
    res.status(500).json({ error: 'Server error while fetching review tasks' });
  }
});

// @route   GET /api/tasks/all
// @desc    Get all tasks for a user (excluding today's tasks)
// @access  Private
router.get('/all', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all tasks except today's
    const tasks = await Task.find({
      user: userId,
      date: { $lt: today }
    }).sort({ date: -1, createdAt: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Server error while fetching all tasks' });
  }
});

// @route   PUT /api/tasks/:id/edit
// @desc    Edit task details
// @access  Private
router.put('/:id/edit', [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('description').optional().trim(),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date } = req.body;
    const taskId = req.params.id;
    const userId = req.user._id;

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task fields
    task.title = title;
    task.description = description;
    
    if (date) {
      // Use the same date parsing logic as task creation
      const [year, month, day] = date.split('-').map(Number);
      task.date = new Date(year, month - 1, day); // month is 0-indexed
    }

    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Edit task error:', error);
    res.status(500).json({ error: 'Server error while editing task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Mark task as done or missed
// @access  Private
router.put('/:id', [
  body('status').isIn(['done', 'missed']).withMessage('Status must be either "done" or "missed"')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const taskId = req.params.id;
    const userId = req.user._id;

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task status
    if (status === 'done') {
      task.markAsDone();
    } else {
      task.markAsMissed();
    }

    await task.save();

    // Update user's weekly stats and streaks
    const user = await User.findById(userId);
    
    if (status === 'done') {
      user.weeklyStats[task.category].completed += 1;
      
      // Update streaks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!user.streaks.lastCompletedDate || 
          new Date(user.streaks.lastCompletedDate).getTime() !== today.getTime()) {
        user.streaks.current += 1;
        user.streaks.longest = Math.max(user.streaks.current, user.streaks.longest);
        user.streaks.lastCompletedDate = today;
      }
    }

    await user.save();

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error while updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update user's weekly stats if task was counted
    if (task.status === 'done') {
      const user = await User.findById(userId);
      user.weeklyStats[task.category].completed = Math.max(0, user.weeklyStats[task.category].completed - 1);
      user.weeklyStats[task.category].total = Math.max(0, user.weeklyStats[task.category].total - 1);
      await user.save();
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error while deleting task' });
  }
});

export default router; 