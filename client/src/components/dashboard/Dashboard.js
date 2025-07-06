import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Flame,
  Trophy,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTask } from '../../contexts/TaskContext';
import { useGuest } from '../../contexts/GuestContext';
import CategoryBadge from '../common/CategoryBadge';
import { format } from 'date-fns';
import { 
  animateCounter, 
  showConfirmationDialog
} from '../../utils/jquery-utils';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, loading, fetchTasks, deleteTask } = useTask();
  const { guest, guestTasks, getGuestTasksByDate, deleteGuestTask } = useGuest();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [deletingTask, setDeletingTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (guest) {
      // For guest users, tasks are managed locally
      // No need to fetch from server
    } else {
      fetchTasks(selectedDate);
    }
  }, [selectedDate, guest, fetchTasks]);

  // Use jQuery to animate counters when stats change
  useEffect(() => {
    if (!loading) {
      // Animate the stat counters
      animateCounter('.completed-count', completedTasks.length);
      animateCounter('.pending-count', pendingTasks.length);
      animateCounter('.missed-count', missedTasks.length);
      animateCounter('.streak-count', user?.streaks?.current || 0);
    }
  }, [tasks, guestTasks, loading, user?.streaks?.current]);

  // Get tasks based on user type
  const currentTasks = guest ? getGuestTasksByDate(selectedDate) : tasks;
  const completedTasks = currentTasks.filter(task => task.status === 'done');
  const pendingTasks = currentTasks.filter(task => task.status === 'pending');
  const missedTasks = currentTasks.filter(task => task.status === 'missed');

  const getCategoryStats = () => {
    const stats = { work: 0, health: 0, personal: 0, learning: 0 };
    currentTasks.forEach(task => {
      if (stats.hasOwnProperty(task.category)) {
        stats[task.category]++;
      }
    });
    return stats;
  };



  const handleEditTask = (task) => {
    // Navigate to edit page or open modal
    navigate(`/edit-task/${task._id}`);
  };

  const handleDeleteTask = async (taskId) => {
    showConfirmationDialog(
      'Are you sure you want to delete this task?',
      async () => {
        setDeletingTask(taskId);
        try {
          const result = guest ? await deleteGuestTask(taskId) : await deleteTask(taskId);
          if (result.success) {
            // Task will be automatically removed from the list due to context update
          }
        } catch (error) {
          console.error('Error deleting task:', error);
        } finally {
          setDeletingTask(null);
        }
      },
      () => {
        // User cancelled deletion
      }
    );
  };

  const quickActions = [
    {
      title: 'Add Task',
      description: 'Create a new task with AI categorization',
      icon: Plus,
      path: '/add-task',
      color: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-600'
    },
    {
      title: 'Review Tasks',
      description: 'Mark yesterday\'s tasks as done or missed',
      icon: CheckSquare,
      path: '/review',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'View Summary',
      description: 'See your weekly progress and statistics',
      icon: BarChart3,
      path: '/summary',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {guest?.name || user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your progress for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            {guest && <span className="ml-2 text-purple-600 font-medium">(Guest Mode)</span>}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900 completed-count">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Pending</p>
                <p className="text-2xl font-bold text-blue-900 pending-count">{pendingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Missed</p>
                <p className="text-2xl font-bold text-red-900 missed-count">{missedTasks.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Streak</p>
                <p className="text-2xl font-bold text-orange-900 streak-count">
                  {guest?.streaks?.current || user?.streaks?.current || 0}
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <Link to={action.path} className="block">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} ${action.hoverColor} transition-colors`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks for today</h3>
                  <p className="text-gray-600 mb-4">Add some tasks to get started!</p>
                  <Link to="/add-task" className="btn-primary">
                    Add Your First Task
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border group ${
                        task.status === 'done'
                          ? 'bg-green-50 border-green-200'
                          : task.status === 'missed'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <CategoryBadge category={task.category} />
                          </div>
                          {task.description && (
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="font-medium">{task.points} points</span>
                            {task.status === 'done' && (
                              <span className="text-green-600 font-medium">✓ Completed</span>
                            )}
                            {task.status === 'missed' && (
                              <span className="text-red-600 font-medium">✗ Missed</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons - Only visible on hover */}
                        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            onClick={() => handleEditTask(task)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleDeleteTask(task._id)}
                            disabled={deletingTask === task._id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete task"
                          >
                            {deletingTask === task._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Distribution and Current Points - hidden for all users until weekend points are given */}
            {/* <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <CategoryBadge category={category} showIcon={false} />
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Point Values</h3>
              <div className="space-y-3">
                {Object.entries(user?.categoryPoints || {}).map(([category, points]) => (
                  <div key={category} className="flex items-center justify-between">
                    <CategoryBadge category={category} showIcon={false} />
                    <span className="font-medium text-gray-900">{points} pts</span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Badges */}
            {user?.badges && user.badges.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Badges</h3>
                <div className="space-y-3">
                  {user.badges.slice(-3).map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">{badge.name}</p>
                        <p className="text-xs text-yellow-700">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 