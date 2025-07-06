import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Flame, 
  Target,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGuest } from '../../contexts/GuestContext';
import { format } from 'date-fns';
import { 
  animateProgressBar
} from '../../utils/jquery-utils';

const Summary = () => {
  const [loading, setLoading] = useState(true);
  const { summary, fetchSummary } = useTask();
  const { user } = useAuth();
  const { guest, getGuestSummary } = useGuest();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSummary = async () => {
      if (guest) {
        // For guest users, summary is calculated locally
        setLoading(false);
      } else {
        await fetchSummary();
        setLoading(false);
      }
    };
    loadSummary();
  }, [fetchSummary, guest]);

  // Animate progress bars when summary data loads
  useEffect(() => {
    const currentSummary = guest ? getGuestSummary() : summary;
    if (currentSummary?.categoryStats) {
      Object.entries(currentSummary.categoryStats).forEach(([category, stats]) => {
        animateProgressBar(`#progress-${category}`, stats.completionRate, 1500);
      });
    }
  }, [summary, guest, getGuestSummary]);





  // Get current summary data based on user type
  const currentSummary = guest ? getGuestSummary() : summary;
  const currentUser = guest || user;

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

          <div className="text-sm text-gray-500">
            Points update automatically every Sunday at 9PM
          </div>
        </div>



        {/* Category Performance and Adaptive Scoring - hidden for all users until weekend points are given */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Performance</h2>
            <div className="space-y-6">
              {currentSummary?.categoryStats && Object.entries(currentSummary.categoryStats).map(([category, stats]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={category} size="md" />
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {stats.completed}/{stats.total} completed
                      </p>
                      <p className={`text-sm font-medium ${getCompletionColor(stats.completionRate)}`}>
                        {Math.round(stats.completionRate)}%
                      </p>
                    </div>
                  </div>
                  <div id={`progress-${category}`} className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full progress-fill ${getProgressBarColor(stats.completionRate)}`}
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{stats.points} points earned</span>
                    <span>Current value: {currentSummary?.currentPoints?.[category] || 10} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Adaptive Scoring</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">How it works</h3>
                <p className="text-blue-700 text-sm">
                  Your task point values automatically adjust based on your weekly performance:
                </p>
                <ul className="text-blue-700 text-sm mt-2 space-y-1">
                  <li>• Poor performance (&lt;50% completion): Points increase</li>
                  <li>• High performance (&gt;80% completion): Points decrease slightly</li>
                  <li>• Points never go below 5 or above 20</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Current Point Values</h3>
                {currentSummary?.currentPoints && Object.entries(currentSummary.currentPoints).map(([category, points]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <CategoryBadge category={category} showIcon={false} />
                    <span className="font-bold text-lg text-gray-900">{points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}

        {/* Streak Information - Moved to top */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Streak Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Summary; 