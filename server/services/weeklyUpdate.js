import User from '../models/User.js';
import { checkAndAwardBadges } from '../routes/summary.js';

// Function to check if it's time for weekly update (Sunday 9PM or later)
export const isWeeklyUpdateTime = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const hour = now.getHours();
  
  return dayOfWeek === 0 && hour >= 21; // Sunday 9PM or later
};

// Function to get the last Sunday 9PM timestamp
export const getLastSunday9PM = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentHour = now.getHours();
  
  const lastSunday = new Date(now);
  
  if (currentDay === 0 && currentHour >= 21) {
    // It's Sunday 9PM or later, so this is the last Sunday 9PM
    lastSunday.setHours(21, 0, 0, 0);
  } else {
    // Go back to the most recent Sunday 9PM
    const daysToSubtract = currentDay === 0 ? 7 : currentDay;
    lastSunday.setDate(now.getDate() - daysToSubtract);
    lastSunday.setHours(21, 0, 0, 0);
  }
  
  return lastSunday;
};

// Function to check if user needs weekly update
export const needsWeeklyUpdate = (user) => {
  const lastSunday9PM = getLastSunday9PM();
  
  // Check if user has a lastUpdateTime field, if not, they need update
  if (!user.lastWeeklyUpdate) {
    return true;
  }
  
  // Check if the last update was before the last Sunday 9PM
  const lastUpdate = new Date(user.lastWeeklyUpdate);
  return lastUpdate < lastSunday9PM;
};

// Function to update user's category points and mark as updated
export const performWeeklyUpdate = async (user) => {
  try {
    console.log(`🔄 Performing weekly update for user: ${user.email}`);
    
    // Check if user has any tasks in the past week
    const categories = ['work', 'health', 'personal', 'learning'];
    const totalWeeklyTasks = categories.reduce((sum, category) => {
      return sum + user.weeklyStats[category].total;
    }, 0);
    
    if (totalWeeklyTasks === 0) {
      console.log(`🆕 User ${user.email} has no tasks in the past week - skipping point adjustments`);
    }
    
    // Update category points based on weekly performance
    user.updateCategoryPoints();
    
    // Reset weekly stats for the new week
    user.resetWeeklyStats();
    
    // Check for new badges
    await checkAndAwardBadges(user);
    
    // Mark the update time
    user.lastWeeklyUpdate = new Date();
    
    await user.save();
    
    console.log(`✅ Weekly update completed for user: ${user.email}`);
    return { success: true, newPoints: user.categoryPoints };
  } catch (error) {
    console.error(`❌ Error performing weekly update for user ${user.email}:`, error);
    return { success: false, error: error.message };
  }
};

// Function to check and perform weekly update if needed
export const checkAndPerformWeeklyUpdate = async (user) => {
  if (needsWeeklyUpdate(user)) {
    console.log(`📅 Sunday 9PM has passed - updating points for user: ${user.email}`);
    return await performWeeklyUpdate(user);
  }
  
  return { success: true, updated: false, message: 'No update needed' };
};

// Function to get next update time
export const getNextUpdateTime = () => {
  const now = new Date();
  const nextSunday = new Date(now);
  
  // Calculate days until next Sunday
  const daysUntilSunday = (7 - now.getDay()) % 7;
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(21, 0, 0, 0); // 9:00 PM
  
  return nextSunday;
}; 