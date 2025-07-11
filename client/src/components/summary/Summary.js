import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Trophy, 
  Flame, 
  Target,
  ArrowLeft,
  Award,
  Download,
  Share2,
  ArrowUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  showToast, 
  scrollToTop, 
  highlightElement,
  onEnterKey,
  onEscapeKey,
  copyToClipboard,
  showLoading,
  hideLoading,
  autoHideElement,
  animateProgressBar
} from '../../utils/jquery-utils';

const Summary = () => {
  const [loading, setLoading] = useState(true);
  const { summary, fetchSummary } = useTask();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSummary = async () => {
      showLoading('#loading-spinner');
      await fetchSummary();
      setLoading(false);
      hideLoading('#loading-spinner');
    };
    loadSummary();
  }, [fetchSummary]);

  // Enhanced UX with jQuery utilities
  useEffect(() => {
    // Keyboard shortcuts
    onEnterKey('body', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        navigate('/');
      }
    });

    onEscapeKey('body', () => {
      navigate('/');
    });

    // Auto-hide loading spinner after 10 seconds
    if (loading) {
      autoHideElement('#loading-spinner', 10000);
    }
  }, [loading, navigate]);

  // Animate progress bars when summary data loads
  useEffect(() => {
    if (summary?.categoryStats) {
      Object.entries(summary.categoryStats).forEach(([category, stats]) => {
        animateProgressBar(`#progress-${category}`, stats.completionRate, 1500);
      });
    }
  }, [summary]);

  // Get current summary data
  const currentSummary = summary;
  const currentUser = user;

  // Enhanced utility functions
  const handleShareSummary = () => {
    const summaryText = `My Habit Builder Summary:
Current Streak: ${currentUser?.streaks?.current || 0} days
Longest Streak: ${currentUser?.streaks?.longest || 0} days
Total Tasks Completed: ${currentSummary?.totalCompleted || 0}
Week: ${currentSummary?.week ? `${format(new Date(currentSummary.week.start), 'MMM d')} - ${format(new Date(currentSummary.week.end), 'MMM d, yyyy')}` : 'This week'}`;
    
    copyToClipboard(summaryText);
    showToast('Summary copied to clipboard!', 'success');
  };

  const handleScrollToTop = () => {
    scrollToTop();
  };

  const handleHighlightStats = () => {
    highlightElement('.streak-stats', 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">Weekly Summary</h1>
              <p className="text-gray-600">
                {currentSummary?.week && (
                  <>
                    {format(new Date(currentSummary.week.start), 'MMM d')} - {format(new Date(currentSummary.week.end), 'MMM d, yyyy')}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Points update automatically every Sunday at 9PM
            </div>
            <motion.button
              onClick={handleShareSummary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Share summary"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Streak Information - Moved to top */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Streak Information</h2>
            <motion.button
              onClick={handleHighlightStats}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Highlight stats"
            >
              <Award className="h-5 w-5" />
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 streak-stats">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Current Streak</h3>
              <p className="text-3xl font-bold text-orange-600">{currentUser?.streaks?.current || 0} days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Longest Streak</h3>
              <p className="text-3xl font-bold text-purple-600">{currentUser?.streaks?.longest || 0} days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Next Goal</h3>
              <p className="text-3xl font-bold text-green-600">
                {Math.max(7, (currentUser?.streaks?.longest || 0) + 1)} days
              </p>
            </div>
          </div>
        </div>

        {/* Badges and Achievements - Moved to middle */}
        {currentUser?.badges && currentUser.badges.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Badges & Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUser.badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg"
                >
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">{badge.name}</p>
                    <p className="text-sm text-yellow-700">{badge.description}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {format(new Date(badge.earnedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Task Statistics - Moved to bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{currentSummary?.stats?.total || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{currentSummary?.stats?.completed || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={handleScrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
};

export default Summary; 