// src/services/apiClient.js
import axios from 'axios';

// ✅ Vite : import.meta.env.VITE_API_URL  (.env → VITE_API_URL=http://localhost:8080)
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
    if (error.response?.status === 403) { window.location.href = '/unauthorized'; }
    return Promise.reject(error);
  }
);

export default apiClient;