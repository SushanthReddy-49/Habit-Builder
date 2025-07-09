import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { showToast } from '../utils/jquery-utils';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [reviewTasks, setReviewTasks] = useState([]);

  // Set up axios base URL
  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5100';
  }, []);

  const fetchTasks = useCallback(async (date = new Date()) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`/api/tasks?date=${formattedDate}`);
      setTasks(response.data);
    } catch (error) {
      showToast('Failed to fetch tasks', 'error');
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      const { task, categorization } = response.data;
      
      // Instead of just adding to local state, refresh the tasks for the current date
      // This ensures the task shows up in the correct date's task list
      // Use the exact same date string that was sent to create the task
      if (taskData.date) {
        // Create a new Date object from the date string, ensuring it's at the start of the day
        const [year, month, day] = taskData.date.split('-').map(Number);
        const taskDate = new Date(year, month - 1, day); // month is 0-indexed
        await fetchTasks(taskDate);
      } else {
        await fetchTasks(new Date());
      }
      
      return { success: true, task, categorization };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add task';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(async (taskId, status) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, { status });
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      setReviewTasks(prev => prev.filter(task => task._id !== taskId));
      
      const statusText = status === 'done' ? 'completed' : 'marked as missed';
      showToast(`Task ${statusText}!`, 'success');
      
      return { success: true, task: updatedTask };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update task';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  }, []);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/edit`, taskData);
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      return { success: true, task: updatedTask };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update task';
      return { success: false, error: message };
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      showToast('Task deleted successfully', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete task';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  }, []);

  const fetchReviewTasks = useCallback(async () => {
    try {
      const response = await axios.get('/api/tasks/review');
      setReviewTasks(response.data);
      return response.data;
    } catch (error) {
      showToast('Failed to fetch review tasks', 'error');
      console.error('Fetch review tasks error:', error);
      return [];
    }
  }, []);

  const fetchSummary = useCallback(async (week = null) => {
    try {
      const params = week ? { week } : {};
      const response = await axios.get('/api/summary', { params });
      setSummary(response.data);
      return response.data;
    } catch (error) {
      showToast('Failed to fetch summary', 'error');
      console.error('Fetch summary error:', error);
      return null;
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      const response = await axios.get('/api/tasks/all');
      return response.data;
    } catch (error) {
      showToast('Failed to fetch all tasks', 'error');
      console.error('Fetch all tasks error:', error);
      return [];
    }
  }, []);



  const value = {
    tasks,
    loading,
    summary,
    reviewTasks,
    fetchTasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchReviewTasks,
    fetchSummary,
    fetchAllTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 