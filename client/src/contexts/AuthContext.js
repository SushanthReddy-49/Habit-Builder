import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setLocalStorage, getLocalStorage, removeLocalStorage, showToast } from '../utils/jquery-utils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    // Set base URL for API requests
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5100';
    
    const token = getLocalStorage('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getLocalStorage('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          removeLocalStorage('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      setLocalStorage('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      showToast('Welcome back!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      const { token, user } = response.data;
      
      setLocalStorage('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      showToast('Account created successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    removeLocalStorage('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    showToast('Logged out successfully', 'success');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 