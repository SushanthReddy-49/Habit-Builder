import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Point values for each category (adaptive scoring system)
  categoryPoints: {
    work: { type: Number, default: 10 },
    health: { type: Number, default: 10 },
    personal: { type: Number, default: 10 },
    learning: { type: Number, default: 10 }
  },
  // Track weekly performance for adaptive scoring
  weeklyStats: {
    work: { completed: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    health: { completed: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    personal: { completed: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    learning: { completed: { type: Number, default: 0 }, total: { type: Number, default: 0 } }
  },
  // Track streaks and badges
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastCompletedDate: { type: Date }
  },
  badges: [{
    name: String,
    earnedAt: { type: Date, default: Date.now },
    description: String
  }],
  // Track when the last weekly update was performed
  lastWeeklyUpdate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update category points based on weekly performance
// Updated logic: Only adjust points if user has participated (has tasks in the past week)
userSchema.methods.updateCategoryPoints = function() {
  const categories = ['work', 'health', 'personal', 'learning'];
  
  // Check if user has any tasks in the past week
  const totalWeeklyTasks = categories.reduce((sum, category) => {
    return sum + this.weeklyStats[category].total;
  }, 0);
  
  // If no tasks in the past week, don't adjust points (user is new or inactive)
  if (totalWeeklyTasks === 0) {
    console.log(`🆕 User has no tasks in the past week - keeping current points unchanged`);
    return;
  }
  
  categories.forEach(category => {
    const stats = this.weeklyStats[category];
    
    if (stats.total === 0) {
      // No tasks in this category this week, keep current points
      return;
    }
    
    const avgCompletion = stats.completed;
    const totalTasks = stats.total;
    
    if (avgCompletion < totalTasks) {
      // User is not completing all tasks in this category - increase points to encourage completion
      this.categoryPoints[category] = Math.min(this.categoryPoints[category] + 2, 20);
      console.log(`📈 Increasing ${category} points to ${this.categoryPoints[category]} (completed: ${avgCompletion}/${totalTasks})`);
    } else if (avgCompletion === totalTasks && totalTasks > 0) {
      // User completed all tasks in this category - reduce points slightly to maintain challenge
      this.categoryPoints[category] = Math.max(this.categoryPoints[category] - 1, 5);
      console.log(`📉 Slightly reducing ${category} points to ${this.categoryPoints[category]} (perfect completion: ${avgCompletion}/${totalTasks})`);
    }
    // If avgCompletion equals totalTasks but totalTasks is 0, no change needed
  });
};

// Method to reset weekly stats
userSchema.methods.resetWeeklyStats = function() {
  const categories = ['work', 'health', 'personal', 'learning'];
  categories.forEach(category => {
    this.weeklyStats[category].completed = 0;
    this.weeklyStats[category].total = 0;
  });
};

export default mongoose.model('User', userSchema); 