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
userSchema.methods.updateCategoryPoints = function() {
  const categories = ['work', 'health', 'personal', 'learning'];
  
  categories.forEach(category => {
    const stats = this.weeklyStats[category];
    const completionRate = stats.total > 0 ? stats.completed / stats.total : 0;
    
    if (completionRate < 0.5) {
      // Poor performance - increase points
      this.categoryPoints[category] = Math.min(this.categoryPoints[category] + 2, 20);
    } else if (completionRate > 0.8) {
      // High performance - decrease points slightly
      this.categoryPoints[category] = Math.max(this.categoryPoints[category] - 1, 5);
    }
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