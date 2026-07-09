import axios from 'axios';

/**
 * Central axios instance for Admin Dashboard.
 *
 * Authentication is handled EXCLUSIVELY via the HttpOnly "adminToken" cookie
 * which the browser sends automatically with every request.
 *
 * The frontend NEVER reads, stores, or attaches JWT tokens manually.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Sends HttpOnly cookies automatically
});

// Response interceptor — redirect to login on any 401, except for auth bootstrap endpoints
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (
      error.response?.status === 401 &&
      !url.includes('/auth/admin/me') &&
      !url.includes('/auth/admin/login')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
