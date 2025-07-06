import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Save, X } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { useGuest } from '../../contexts/GuestContext';
import { validateForm, showToast } from '../../utils/jquery-utils';

const TaskEdit = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTask();
  const { guest, getGuestTaskById, updateGuestTask } = useGuest();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);

  useEffect(() => {
    const loadTask = () => {
      let currentTask;
      if (guest) {
        currentTask = getGuestTaskById(taskId);
      } else {
        currentTask = tasks.find(t => t._id === taskId);
      }
      
      if (currentTask) {
        setTask(currentTask);
        setFormData({
          title: currentTask.title,
          description: currentTask.description || '',
          date: new Date(currentTask.date).toISOString().split('T')[0]
        });
      } else {
        showToast('Task not found', 'error');
        navigate('/');
      }
    };

    loadTask();
  }, [taskId, tasks, guest, getGuestTaskById, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm('#edit-task-form')) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);

    try {
      const result = guest 
        ? await updateGuestTask(taskId, formData)
        : await updateTask(taskId, formData);
      
      if (result.success) {
        showToast('Task updated successfully!', 'success');
        navigate('/');
      } else {
        showToast(result.error || 'Failed to update task', 'error');
      }
    } catch (error) {
      showToast('An error occurred while updating the task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
              <p className="text-gray-600">Update your task details</p>
            </div>
          </div>
        </div>

        {/* Task Form */}
        <div className="card">
          <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-6">
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Update Task</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30 flex items-center space-x-2"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskEdit; 