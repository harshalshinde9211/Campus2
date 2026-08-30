import axios from 'axios';

/**
 * In development:
 *   VITE_API_URL is empty → baseURL = '' → all /api/* requests go to
 *   the same origin (localhost:5173) → Vite proxy forwards them to
 *   localhost:5000 → no CORS issues.
 *
 * In production:
 *   Set VITE_API_URL=https://your-backend.com in your deployment env.
 */
const API_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: clear auth and redirect to login
// Skip redirect for /api/auth/me (called on startup to restore session)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      if (!url.includes('/api/auth/me')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
