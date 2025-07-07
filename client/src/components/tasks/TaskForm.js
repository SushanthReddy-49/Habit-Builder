import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Plus } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGuest } from '../../contexts/GuestContext';
import {
  validateForm,
  showToast,
  clearForm,
  focusFirstInput,
  onEnterKey,
  onEscapeKey,
  showLoading,
  hideLoading,
  autoHideElement
} from '../../utils/jquery-utils';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const { addTask } = useTask();
  const { addGuestTask, guest } = useGuest();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Enhanced form handling with jQuery utilities
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use jQuery for form validation
    if (!validateForm('#task-form')) {
      showToast('Please fill in all required fields', 'error');
      focusFirstInput('#task-form');
      return;
    }
    
    setLoading(true);
    showLoading('#loading-spinner');

    try {
      // Use appropriate function based on user type
      const result = guest ? await addGuestTask(formData) : await addTask(formData);
      
      if (result.success) {
        clearForm('#task-form');
        setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
        
        // Show success message with jQuery toast
        showToast(`Task added! Categorized as ${result.categorization.category}`, 'success');
        
        // Navigate back immediately after successful task creation
        navigate('/');
      } else {
        showToast(result.error || 'Failed to add task', 'error');
      }
    } catch (error) {
      showToast('An error occurred while adding the task', 'error');
    } finally {
      setLoading(false);
      hideLoading('#loading-spinner');
    }
  };

  // Keyboard shortcuts for better UX
  React.useEffect(() => {
    // Enter key to submit form
    onEnterKey('#task-form', (e) => {
      if (e.target.tagName === 'TEXTAREA') {
        // Allow new lines in textarea
        return;
      }
      e.preventDefault();
      handleSubmit(e);
    });

    // Escape key to go back
    onEscapeKey('body', () => {
      navigate('/');
    });

    // Focus first input on mount
    focusFirstInput('#task-form');

    // Auto-hide loading spinner after 10 seconds
    if (loading) {
      autoHideElement('#loading-spinner', 10000);
    }
  }, [loading, navigate]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Task</h1>
            <p className="text-gray-600">Create a task and let AI categorize it for you</p>
          </div>
        </div>

        {/* Task Form */}
        <div className="card">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Complete project presentation, Go for a run, Read chapter 5"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Add more details about your task..."
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span className="text-lg">Adding Task...</span>
                </div>
              ) : (
                <span className="text-lg">Add Task</span>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskForm; 