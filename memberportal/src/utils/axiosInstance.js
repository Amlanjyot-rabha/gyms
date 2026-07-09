import axios from 'axios';

/**
 * Central axios instance for Member Portal.
 *
 * Authentication is handled EXCLUSIVELY via the HttpOnly "memberToken" cookie
 * which the browser sends automatically with every request.
 *
 * The frontend NEVER reads, stores, or attaches JWT tokens manually.
 *
 * IMPORTANT: This interceptor does NOT handle navigation or redirects.
 * Navigation is managed by AuthContext and components, not axios.
 * This prevents race conditions between browser redirects and React Router.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Sends HttpOnly cookies automatically
  timeout: 10000, // 10 second timeout
});

// Request interceptor — log outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('[AXIOS] Sending request:', { method: config.method, url: config.url, data: config.data });
    return config;
  },
  (error) => {
    console.error('[AXIOS] Request preparation error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor — log responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response received:', { status: response.status, url: response.config.url, data: response.data });
    return response;
  },
  (error) => {
    console.error('[AXIOS] Response error:', { status: error.response?.status, url: error.config?.url, message: error.message });
    // Simply reject the error - let components handle auth failures
    // This prevents race conditions with React Router navigation
    return Promise.reject(error);
  }
);

export default axiosInstance;
