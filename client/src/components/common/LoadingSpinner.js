import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInElement } from '../../utils/jquery-utils';

const LoadingSpinner = () => {
  useEffect(() => {
    // Use jQuery to add a subtle fade-in effect
    fadeInElement('.loading-container', 500);
  }, []);

  return (
    <div className="loading-container min-h-screen flex items-center justify-center bg-gray-50" style={{ opacity: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-600 font-medium">Loading Habit Builder...</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner; 