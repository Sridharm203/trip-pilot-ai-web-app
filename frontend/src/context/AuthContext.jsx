import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState(null);       

  // Checks browser storage to auto-login the user on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Fetch fresh user record data to verify token status
          const response = await api.get('users/profile/');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error("Session expired or invalid, cleaning up files", err);
          
          // Clear local storage data immediately to prevent stale request loops
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false); 
    };

    checkAuth();
  }, []);

  // Sends raw credentials payload package to the backend API router
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('users/login/', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData); 
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Invalid email or password';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handles new profile registration forms
  const register = async (username, email, password, firstName, lastName) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('users/register/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      return await login(email, password);
    } catch (err) {
      let errMsg = 'Registration failed. Please check details.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.email) errMsg = data.email[0];
        else if (data.username) errMsg = data.username[0];
        else if (data.password) errMsg = data.password[0];
        else if (data.detail) errMsg = data.detail;
      }
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Destroys the local token instances cleanly regardless of server state response codes
  const logout = async () => {
    setLoading(true);
    
    // Clear storage keys instantly to secure the interface state first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    try {
      // Notify backend server parameters
      await api.post('users/logout/');
    } catch (err) {
      console.warn("Server side logout failed.");
    }
    setLoading(false);
  };

  // Updates custom travel preference dictionaries in the database models
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('users/profile/', profileData);
      const updatedUser = response.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to update profile details';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom React hook allowing components to quickly access auth state and methods
export const useAuth = () => useContext(AuthContext);