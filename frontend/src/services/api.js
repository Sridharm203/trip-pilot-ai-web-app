import axios from 'axios';

// The base address of our Django REST API server running locally
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

/**
 * CREATE AXIOS CLIENT INSTANCE
 * This groups common configurations like the baseURL and default request headers
 * so we don't have to define them on every single API request.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 1. REQUEST INTERCEPTOR: Injects JWT Access Token
 * Before Axios sends out any HTTP request, this interceptor runs.
 * It reads the 'accessToken' from local browser storage, and if it exists,
 * injects it into the Authorization header (e.g. "Bearer eyJhbGciOi...").
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;  
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 2. RESPONSE INTERCEPTOR: Auto-handles Token Expiration (401 error)
 * Intercepts responses returned by the backend.
 * If the response contains a 401 error, we clear user session data and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Session expired or invalid. Please log in again.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
