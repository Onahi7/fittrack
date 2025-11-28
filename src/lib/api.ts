import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase token to all requests
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const api = {
  // Users
  users: {
    create: (data: { id: string; email: string; displayName?: string; photoURL?: string }) =>
      apiClient.post('/users', data),
    getMe: () => apiClient.get('/users/me'),
    getProfile: () => apiClient.get('/users/me/profile'),
    updateProfile: (data: any) => apiClient.put('/users/me/profile', data),
    deleteAccount: () => apiClient.delete('/users/me'),
  },

  // Meals
  meals: {
    create: (data: any) => apiClient.post('/meals', data),
    getByDate: (date: string) => apiClient.get('/meals', { params: { date } }),
    getById: (id: number) => apiClient.get(`/meals/${id}`),
    delete: (id: number) => apiClient.delete(`/meals/${id}`),
    getDailyStats: (date: string) =>
      apiClient.get('/meals/stats/daily', { params: { date } }),
  },

  // Streaks
  streaks: {
    getAll: () => apiClient.get('/streaks'),
    checkIn: (type: string) => apiClient.post('/streaks/checkin', { type }),
  },

  // Journal
  journal: {
    create: (data: any) => apiClient.post('/journal', data),
    getByDate: (date: string) => apiClient.get('/journal', { params: { date } }),
    getAll: () => apiClient.get('/journal'),
    getById: (id: number) => apiClient.get(`/journal/${id}`),
    delete: (id: number) => apiClient.delete(`/journal/${id}`),
  },

  // Water
  water: {
    log: (glasses: number, date: string) =>
      apiClient.post('/water', { glasses, date }),
    getByDate: (date: string) => apiClient.get('/water', { params: { date } }),
  },
};

export default apiClient;
