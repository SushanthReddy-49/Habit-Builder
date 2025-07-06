import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useGuest } from './contexts/GuestContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import GuestLogin from './components/auth/GuestLogin';
import Dashboard from './components/dashboard/Dashboard';
import TaskForm from './components/tasks/TaskForm';
import TaskEdit from './components/tasks/TaskEdit';
import TaskReview from './components/tasks/TaskReview';
import Summary from './components/summary/Summary';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import { initializeJQueryUtils } from './utils/jquery-utils';

function App() {
  const { user, loading } = useAuth();
  const { guest } = useGuest();
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  // Initialize jQuery utilities when component mounts
  useEffect(() => {
    initializeJQueryUtils();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {user || guest ? (
          <motion.div
            key="authenticated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-task" element={<TaskForm />} />
                <Route path="/edit-task/:taskId" element={<TaskEdit />} />
                <Route path="/review" element={<TaskReview />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="unauthenticated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50"
          >
            <Routes>
              <Route path="/login" element={<Login onShowGuestLogin={() => setShowGuestLogin(true)} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Guest Login Modal */}
      {showGuestLogin && (
        <GuestLogin onClose={() => setShowGuestLogin(false)} />
      )}
    </div>
  );
}

export default App; 