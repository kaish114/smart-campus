import React, { createContext, useState, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated based on token in localStorage
  const checkAuthStatus = useCallback(async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // If no token, user is not authenticated
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if token is expired
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token is expired
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      // Set token in axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get user data
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      setLoading(false);
    } catch (err) {
      console.error('Authentication error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError('Authentication failed. Please log in again.');
      setLoading(false);
    }
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set token in axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setUser(response.data.user);
      setError(null);
      setLoading(false);
      
      toast.success('Registration successful!');
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Registration failed. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/login', { email, password });
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set token in axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setUser(response.data.user);
      setError(null);
      setLoading(false);
      
      toast.success('Login successful!');
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Login failed. Please check your credentials.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove token from axios header
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
    setError(null);
    
    toast.info('You have been logged out');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await api.put('/api/auth/updatedetails', userData);
      
      // Update user in localStorage
      const updatedUser = { ...user, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setError(null);
      setLoading(false);
      
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Failed to update profile. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await api.put('/api/auth/updatepassword', {
        currentPassword,
        newPassword
      });
      
      // Update token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Update token in axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setError(null);
      setLoading(false);
      
      toast.success('Password changed successfully!');
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Failed to change password. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/forgotpassword', { email });
      
      setError(null);
      setLoading(false);
      
      toast.success('Password reset email sent!');
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Failed to send reset email. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (resetToken, newPassword) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/auth/resetpassword/${resetToken}`, {
        password: newPassword
      });
      
      setError(null);
      setLoading(false);
      
      toast.success('Password reset successful! Please log in with your new password.');
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data.error 
        ? err.response.data.error 
        : 'Failed to reset password. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is faculty
  const isFaculty = () => {
    return user && (user.role === 'faculty' || user.role === 'admin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        checkAuthStatus,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        isAdmin,
        isFaculty
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};