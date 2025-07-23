import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from '../config/api';
import type { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
  const headers = getAuthHeader();
  if (headers.Authorization) {
    if (config.headers && typeof config.headers === 'object') {
      // If Axios v1, headers may be an instance of AxiosHeaders
      if (typeof (config.headers as any).set === 'function') {
        (config.headers as AxiosHeaders).set('Authorization', headers.Authorization);
      } else {
        (config.headers as Record<string, any>)['Authorization'] = headers.Authorization;
      }
    }
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;