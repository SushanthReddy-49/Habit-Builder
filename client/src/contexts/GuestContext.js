import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  setLocalStorage, 
  getLocalStorage, 
  removeLocalStorage,
  showToast,
  highlightElement 
} from '../utils/jquery-utils';

const GuestContext = createContext();

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};

export const GuestProvider = ({ children }) => {
  const [guest, setGuest] = useState(null);
  const [guestTasks, setGuestTasks] = useState([]);
  const [guestStats, setGuestStats] = useState({
    streaks: { current: 0, longest: 0 },
    badges: [],
    categoryPoints: { work: 10, health: 10, personal: 10, learning: 10 }
  });

  // Initialize guest on app load
  useEffect(() => {
    // Set base URL for API requests
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5100';
    
    initializeGuest();
    loadGuestData();
  }, []);

  const initializeGuest = () => {
    let guestId = getLocalStorage('guestId');
    let guestName = getLocalStorage('guestName');
    
    if (!guestId) {
      guestId = uuidv4();
      setLocalStorage('guestId', guestId);
    }

    if (guestName) {
      setGuest({ id: guestId, name: guestName, isGuest: true });
    }
  };

  const loadGuestData = () => {
    // Load tasks from localStorage
    const savedTasks = getLocalStorage('guestTasks');
    if (savedTasks) {
      setGuestTasks(savedTasks);
    }

    // Load stats from localStorage
    const savedStats = getLocalStorage('guestStats');
    if (savedStats) {
      setGuestStats(savedStats);
    }

    // Load guest data including timezone offset
    const guestId = getLocalStorage('guestId');
    const guestName = getLocalStorage('guestName');
    const timezoneOffset = getLocalStorage('guestTimezoneOffset');
    
    if (guestId && guestName) {
      setGuest({
        id: guestId,
        name: guestName,
        isGuest: true,
        timezoneOffset: timezoneOffset ? parseInt(timezoneOffset) : new Date().getTimezoneOffset()
      });
    }
  };

  const saveGuestData = () => {
    setLocalStorage('guestTasks', guestTasks);
    setLocalStorage('guestStats', guestStats);
  };

  const startGuestSession = async (name) => {
    try {
      const guestId = getLocalStorage('guestId');
      const timezoneOffset = new Date().getTimezoneOffset(); // Get offset in minutes
      
      // Save name to database
      const response = await axios.post('/api/guest/save-name', {
        name,
        guestId
      });

      const guestData = {
        id: guestId,
        name,
        isGuest: true,
        timezoneOffset: timezoneOffset,
        ...response.data.guest
      };

      setGuest(guestData);
      setLocalStorage('guestName', name);
      setLocalStorage('guestTimezoneOffset', timezoneOffset.toString());
      
      showToast(`Welcome, ${name}! You're now using Habit Builder as a guest.`, 'success');
      return { success: true, guest: guestData };
    } catch (error) {
      console.error('Start guest session error:', error);
      showToast('Failed to start guest session', 'error');
      return { success: false, error: error.message };
    }
  };

  const addGuestTask = async (taskData) => {
    try {
      // Simulate AI categorization (in real app, this would call OpenAI)
      const categories = ['work', 'health', 'personal', 'learning'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Handle date properly using user's timezone
      let taskDate;
      if (taskData.date) {
        // Parse the date string and create date in user's timezone
        const [year, month, day] = taskData.date.split('-').map(Number);
        // Create date at midnight in user's timezone
        taskDate = new Date(year, month - 1, day);
        // Adjust for timezone offset to ensure it stays in user's timezone
        const timezoneOffset = guest?.timezoneOffset || new Date().getTimezoneOffset();
        taskDate.setMinutes(taskDate.getMinutes() - timezoneOffset);
      } else {
        taskDate = new Date();
      }
      
      const newTask = {
        _id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        category: randomCategory,
        status: 'pending',
        points: guestStats.categoryPoints[randomCategory],
        date: taskDate.toISOString(),
        createdAt: new Date().toISOString(),
        user: guest?.id
      };

      setGuestTasks(prev => [...prev, newTask]);
      
      // Update stats
      setGuestStats(prev => ({
        ...prev,
        categoryPoints: {
          ...prev.categoryPoints,
          [randomCategory]: Math.min(prev.categoryPoints[randomCategory] + 1, 20)
        }
      }));

      return { success: true, task: newTask, categorization: { category: randomCategory, confidence: 0.8 } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateGuestTaskStatus = async (taskId, status) => {
    try {
      setGuestTasks(prev => prev.map(task => 
        task._id === taskId 
          ? { ...task, status, completedAt: status === 'done' ? new Date().toISOString() : null }
          : task
      ));

      // Update streaks if task is completed
      if (status === 'done') {
        const today = new Date().toDateString();
        const lastCompleted = getLocalStorage('lastCompletedDate');
        
        if (lastCompleted !== today) {
          const newStreak = guestStats.streaks.current + 1;
          setGuestStats(prev => ({
            ...prev,
            streaks: {
              current: newStreak,
              longest: Math.max(newStreak, prev.streaks.longest)
            }
          }));
          setLocalStorage('lastCompletedDate', today);
        }
      }

      const statusText = status === 'done' ? 'completed' : 'marked as missed';
      showToast(`Task ${statusText}!`, 'success');
      return { success: true };
    } catch (error) {
      showToast('Failed to update task', 'error');
      return { success: false, error: error.message };
    }
  };

  const getGuestTaskById = (taskId) => {
    return guestTasks.find(task => task._id === taskId);
  };

  const updateGuestTask = async (taskId, taskData) => {
    try {
      setGuestTasks(prev => prev.map(task => 
        task._id === taskId 
          ? { 
              ...task, 
              title: taskData.title,
              description: taskData.description,
              date: taskData.date ? (() => {
                const [year, month, day] = taskData.date.split('-').map(Number);
                const newDate = new Date(year, month - 1, day);
                const timezoneOffset = guest?.timezoneOffset || new Date().getTimezoneOffset();
                newDate.setMinutes(newDate.getMinutes() - timezoneOffset);
                return newDate.toISOString();
              })() : task.date
            }
          : task
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteGuestTask = async (taskId) => {
    try {
      setGuestTasks(prev => prev.filter(task => task._id !== taskId));
      showToast('Task deleted successfully', 'success');
      return { success: true };
    } catch (error) {
      showToast('Failed to delete task', 'error');
      return { success: false, error: error.message };
    }
  };

  const getGuestTasksByDate = (date) => {
    // Use the same date parsing logic as task creation with timezone
    let targetDate;
    if (date instanceof Date) {
      targetDate = new Date(date);
    } else {
      // If date is a string like "2025-07-05"
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day);
      // Adjust for timezone offset
      const timezoneOffset = guest?.timezoneOffset || new Date().getTimezoneOffset();
      targetDate.setMinutes(targetDate.getMinutes() - timezoneOffset);
    }
    
    return guestTasks.filter(task => {
      const taskDate = new Date(task.date);
      // Compare dates by setting both to start of day in user's timezone
      const taskDateStart = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      const targetDateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      return taskDateStart.getTime() === targetDateStart.getTime();
    });
  };

  const getGuestSummary = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyTasks = guestTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    const stats = {
      total: weeklyTasks.length,
      completed: weeklyTasks.filter(t => t.status === 'done').length,
      missed: weeklyTasks.filter(t => t.status === 'missed').length,
      pending: weeklyTasks.filter(t => t.status === 'pending').length,
      totalPoints: weeklyTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.points, 0)
    };

    const categoryStats = {};
    ['work', 'health', 'personal', 'learning'].forEach(category => {
      const categoryTasks = weeklyTasks.filter(t => t.category === category);
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

    return {
      week: { start: weekStart, end: weekEnd },
      stats,
      categoryStats,
      currentPoints: guestStats.categoryPoints,
      streaks: guestStats.streaks,
      badges: guestStats.badges
    };
  };

  const clearGuestData = () => {
    removeLocalStorage('guestId');
    removeLocalStorage('guestName');
    removeLocalStorage('guestTimezoneOffset');
    removeLocalStorage('guestTasks');
    removeLocalStorage('guestStats');
    removeLocalStorage('lastCompletedDate');
    
    setGuest(null);
    setGuestTasks([]);
    setGuestStats({
      streaks: { current: 0, longest: 0 },
      badges: [],
      categoryPoints: { work: 10, health: 10, personal: 10, learning: 10 }
    });
  };

  // Save data whenever it changes
  useEffect(() => {
    if (guest) {
      saveGuestData();
    }
  }, [guestTasks, guestStats]);

  const value = {
    guest,
    guestTasks,
    guestStats,
    startGuestSession,
    addGuestTask,
    updateGuestTaskStatus,
    getGuestTaskById,
    updateGuestTask,
    deleteGuestTask,
    getGuestTasksByDate,
    getGuestSummary,
    clearGuestData
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
}; 