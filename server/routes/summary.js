import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/summary
// @desc    Get weekly summary and statistics
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { week } = req.query;

    // Calculate week start and end dates
    let weekStart, weekEnd;
    if (week) {
      weekStart = new Date(week);
      weekEnd = new Date(week);
      weekEnd.setDate(weekEnd.getDate() + 6);
    } else {
      // Current week
      weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
    }

    // Get tasks for the week
    const tasks = await Task.find({
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd }
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      missed: tasks.filter(t => t.status === 'missed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      totalPoints: tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.points, 0)
    };

    // Calculate category breakdown
    const categories = ['work', 'health', 'personal', 'learning'];
    const categoryStats = {};

    categories.forEach(category => {
      const categoryTasks = tasks.filter(t => t.category === category);
      const completed = categoryTasks.filter(t => t.status === 'done').length;
      const total = categoryTasks.length;
      
      categoryStats[category] = {
        total,
        completed,
        missed: categoryTasks.filter(t => t.status === 'missed').length,
        pending: categoryTasks.filter(t => t.status === 'pending').length,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        points: categoryTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.points, 0)
      };
    });

    // Get user's current category points
    const user = await User.findById(userId);
    const currentPoints = user.categoryPoints;

    res.json({
      week: {
        start: weekStart,
        end: weekEnd
      },
      stats,
      categoryStats,
      currentPoints,
      streaks: user.streaks,
      badges: user.badges
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error while fetching summary' });
  }
});

// @route   POST /api/summary/update-points
// @desc    Update category points based on weekly performance (called at end of week)
// @access  Private
router.post('/update-points', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update category points based on weekly performance
    user.updateCategoryPoints();
    
    // Reset weekly stats
    user.resetWeeklyStats();
    
    // Check for new badges
    await checkAndAwardBadges(user);
    
    await user.save();

    res.json({
      message: 'Category points updated successfully',
      newPoints: user.categoryPoints,
      badges: user.badges
    });
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ error: 'Server error while updating points' });
  }
});

// @route   GET /api/summary/streaks
// @desc    Get user's streak information
// @access  Private
router.get('/streaks', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      current: user.streaks.current,
      longest: user.streaks.longest,
      lastCompletedDate: user.streaks.lastCompletedDate
    });
  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({ error: 'Server error while fetching streaks' });
  }
});

// @route   GET /api/summary/badges
// @desc    Get user's badges
// @access  Private
router.get('/badges', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Server error while fetching badges' });
  }
});

// Helper function to check and award badges
const checkAndAwardBadges = async (user) => {
  const existingBadges = user.badges.map(b => b.name);
  const newBadges = [];

  // First task badge
  if (!existingBadges.includes('First Task') && user.streaks.current >= 1) {
    newBadges.push({
      name: 'First Task',
      description: 'Completed your first task!',
      earnedAt: new Date()
    });
  }

  // Streak badges
  if (!existingBadges.includes('3 Day Streak') && user.streaks.current >= 3) {
    newBadges.push({
      name: '3 Day Streak',
      description: 'Maintained a 3-day completion streak!',
      earnedAt: new Date()
    });
  }

  if (!existingBadges.includes('7 Day Streak') && user.streaks.current >= 7) {
    newBadges.push({
      name: '7 Day Streak',
      description: 'Maintained a 7-day completion streak!',
      earnedAt: new Date()
    });
  }

  if (!existingBadges.includes('30 Day Streak') && user.streaks.current >= 30) {
    newBadges.push({
      name: '30 Day Streak',
      description: 'Maintained a 30-day completion streak!',
      earnedAt: new Date()
    });
  }

  // Perfect week badge
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weeklyTasks = await Task.find({
    user: user._id,
    date: { $gte: weekStart, $lte: weekEnd }
  });

  const completedTasks = weeklyTasks.filter(t => t.status === 'done');
  
  if (weeklyTasks.length > 0 && completedTasks.length === weeklyTasks.length && 
      !existingBadges.includes('Perfect Week')) {
    newBadges.push({
      name: 'Perfect Week',
      description: 'Completed all tasks in a week!',
      earnedAt: new Date()
    });
  }

  // Add new badges to user
  user.badges.push(...newBadges);
  
  return newBadges;
};

export default router; 