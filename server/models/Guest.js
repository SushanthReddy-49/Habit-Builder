import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Store a unique guest identifier
  guestId: {
    type: String,
    required: true,
    unique: true
  },
  // Track if they've used the app
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Optional: track how many times they've used the app
  visitCount: {
    type: Number,
    default: 1
  },
  // Store their preferences if they want to convert to full account later
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
guestSchema.index({ lastActive: 1 });

// Method to update last active time
guestSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  this.visitCount += 1;
  return this.save();
};

export default mongoose.model('Guest', guestSchema); 