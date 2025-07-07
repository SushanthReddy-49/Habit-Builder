import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowLeft, Clock, Calendar } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import CategoryBadge from '../common/CategoryBadge';
import { format, subDays } from 'date-fns';
import { showToast, slideDownElement, slideUpElement } from '../../utils/jquery-utils';

const TaskReview = () => {
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState(null);
  const { reviewTasks, fetchReviewTasks, updateTaskStatus } = useTask();
  const navigate = useNavigate();

  useEffect(() => {
    const loadReviewTasks = async () => {
      await fetchReviewTasks();
      setLoading(false);
    };
    loadReviewTasks();
  }, [fetchReviewTasks]);

  const handleTaskAction = async (taskId, status) => {
    setUpdatingTask(taskId);
    
    const result = await updateTaskStatus(taskId, status);
    
    setUpdatingTask(null);
    
    // Toast notifications are handled by the context functions
    // No need to show additional toasts here
  };

  const yesterday = subDays(new Date(), 1);
  yesterday.setHours(0, 0, 0, 0); // Ensure it's start of day
  
  // Get current review tasks
  const currentReviewTasks = reviewTasks;
  
  // Additional safeguard: filter out any tasks that are not from yesterday
  const filteredReviewTasks = currentReviewTasks.filter(task => {
    const taskDate = new Date(task.date);
    const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    return taskDateOnly.getTime() === yesterdayOnly.getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Task Review</h1>
            <p className="text-gray-600">
              Review your tasks from {format(yesterday, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {filteredReviewTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 mb-6">
              You've already reviewed all your tasks from yesterday.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Review Your Tasks</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Mark each task as completed or missed. This helps us track your progress 
                    and adjust your scoring system accordingly.
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {filteredReviewTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <CategoryBadge category={task.category} />
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(task.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{task.points} points</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        onClick={() => handleTaskAction(task._id, 'done')}
                        disabled={updatingTask === task._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-success flex items-center space-x-2 disabled:opacity-50"
                      >
                        {updatingTask === task._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Done</span>
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleTaskAction(task._id, 'missed')}
                        disabled={updatingTask === task._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-danger flex items-center space-x-2 disabled:opacity-50"
                      >
                        {updatingTask === task._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span>Missed</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TaskReview; 