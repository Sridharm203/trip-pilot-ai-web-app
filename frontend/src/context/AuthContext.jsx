import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored credentials when app loads
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Proactively sync user data with backend on load
          const response = await api.get('users/profile/');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error("Token validation failed, clearing local session", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('users/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
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
      // Automatic login after successful registration
      return await login(email, password);
    } catch (err) {
      // Collect field-specific errors if available, else generic error
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

  const logout = async () => {
    setLoading(true);
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        await api.post('users/logout/', { refresh });
      }
    } catch (err) {
      console.warn("Logout request on server failed, clearing local session anyway", err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint handles updating user (names) + profile properties
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

export const useAuth = () => useContext(AuthContext);
