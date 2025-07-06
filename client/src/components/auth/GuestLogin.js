import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Play, Sparkles } from 'lucide-react';
import { useGuest } from '../../contexts/GuestContext';
import { useAuth } from '../../contexts/AuthContext';
import { $ } from '../../utils/jquery-utils';

const GuestLogin = ({ onClose }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { startGuestSession } = useGuest();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      $().showToast('Please enter your name', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await startGuestSession(name.trim());
      
      if (result.success) {
        // Animate the form out
        $().slideUp('.guest-login-form', () => {
          onClose();
        });
      }
    } catch (error) {
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularLogin = () => {
    $().slideUp('.guest-login-form', () => {
      onClose();
      // Trigger regular login modal
      setTimeout(() => {
        $().showModal('#login-modal');
      }, 300);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 guest-login-form"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Try Habit Builder
          </h2>
          <p className="text-gray-600">
            Experience the app without creating an account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-2">
              What should we call you?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="guest-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                maxLength={50}
                autoFocus
              />
            </div>
          </div>

          {/* Guest Features */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-800 flex items-center">
              <Play className="w-4 h-4 mr-2 text-green-500" />
              What you'll get:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                AI-powered task categorization
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Adaptive scoring system
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Progress tracking & streaks
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Data saved locally (private)
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start as Guest
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegularLogin}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your data is stored locally and will be lost if you clear your browser data.
            <br />
            You can always create an account later to save your progress.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GuestLogin; 