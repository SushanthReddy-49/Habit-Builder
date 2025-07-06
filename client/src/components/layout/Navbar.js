import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Plus, 
  CheckSquare, 
  BarChart3, 
  LogOut, 
  User, 
  Menu, 
  X,
  Trophy,
  Flame
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGuest } from '../../contexts/GuestContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { guest, clearGuestData } = useGuest();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/add-task', label: 'Add Task', icon: Plus },
    { path: '/review', label: 'Review', icon: CheckSquare },
    { path: '/summary', label: 'Summary', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gradient">Habit Builder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Streak Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {guest?.streaks?.current || user?.streaks?.current || 0} day streak
              </span>
            </div>

            {/* User Avatar and Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(guest?.name || user?.name)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {guest?.name || user?.name}
                  {guest && <span className="ml-1 text-purple-600 text-xs">(Guest)</span>}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {guest?.name || user?.name}
                      {guest && <span className="ml-1 text-purple-600 text-xs">(Guest)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {guest ? 'Guest User' : user?.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (guest) {
                        clearGuestData();
                      } else {
                        logout();
                      }
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{guest ? 'Clear Guest Data' : 'Sign Out'}</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 