import axios from 'axios';

/**
 * Axios instance for CMS Site.
 *
 * The CMS site only calls PUBLIC read-only endpoints (GET /api/cms, GET /api/gym).
 * No authentication is required — no tokens, no cookies.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
