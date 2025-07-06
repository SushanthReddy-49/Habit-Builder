import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['work', 'health', 'personal', 'learning'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'done', 'missed'],
    default: 'pending'
  },
  points: {
    type: Number,
    default: 10
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  // For task review flow - when user marks as done/missed
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewedAt: {
    type: Date
  },
  // AI confidence score for categorization
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
taskSchema.index({ user: 1, date: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, category: 1 });

// Method to mark task as completed
taskSchema.methods.markAsDone = function() {
  this.status = 'done';
  this.completedAt = new Date();
  this.reviewed = true;
  this.reviewedAt = new Date();
};

// Method to mark task as missed
taskSchema.methods.markAsMissed = function() {
  this.status = 'missed';
  this.reviewed = true;
  this.reviewedAt = new Date();
};

// Static method to get tasks for a specific date
taskSchema.statics.getTasksByDate = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ createdAt: 1 });
};

// Static method to get pending tasks for review
taskSchema.statics.getPendingReview = function(userId, date) {
  // Ensure we're working with the start of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'pending'
  }).sort({ createdAt: 1 });
};

export default mongoose.model('Task', taskSchema); 