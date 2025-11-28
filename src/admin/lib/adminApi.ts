import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance for admin API calls
export const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add admin token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API endpoints
export const adminApiService = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      adminApi.post('/admin/login', credentials),
    logout: () => adminApi.post('/admin/logout'),
    getProfile: () => adminApi.get('/admin/profile'),
  },

  // Users Management
  users: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
      adminApi.get('/users', { params }),
    getById: (id: string) => adminApi.get(`/users/${id}`),
    update: (id: string, data: any) => adminApi.patch(`/users/${id}`, data),
    delete: (id: string) => adminApi.delete(`/users/${id}`),
    getStats: () => adminApi.get('/users/stats'),
  },

  // Meals Management
  meals: {
    getAll: (params?: { page?: number; limit?: number; userId?: string }) =>
      adminApi.get('/meals', { params }),
    getById: (id: string) => adminApi.get(`/meals/${id}`),
    delete: (id: string) => adminApi.delete(`/meals/${id}`),
    getStats: () => adminApi.get('/meals/stats'),
  },

  // Journal Management
  journal: {
    getAll: (params?: { page?: number; limit?: number; userId?: string }) =>
      adminApi.get('/journal', { params }),
    getById: (id: string) => adminApi.get(`/journal/${id}`),
    delete: (id: string) => adminApi.delete(`/journal/${id}`),
  },

  // Water Tracking
  water: {
    getAll: (params?: { page?: number; limit?: number; userId?: string }) =>
      adminApi.get('/water', { params }),
    getStats: () => adminApi.get('/water/stats'),
  },

  // Analytics
  analytics: {
    getDashboard: () => adminApi.get('/admin/analytics/dashboard'),
    getUserGrowth: (period: string) => adminApi.get(`/admin/analytics/users/growth?period=${period}`),
    getEngagement: () => adminApi.get('/admin/analytics/engagement'),
  },

  // Subscriptions Management
  subscriptions: {
    getAll: (page: number = 1, limit: number = 50) =>
      adminApi.get('/subscriptions/admin/all', { params: { page, limit } }),
    getById: (id: number) => adminApi.get(`/subscriptions/admin/${id}`),
    create: (data: {
      userEmail: string;
      tier: 'free' | 'premium' | 'pro';
      amount?: number;
      paymentProvider?: 'paystack' | 'opay';
      autoRenew?: boolean;
    }) => adminApi.post('/subscriptions/admin/create', data),
    update: (id: number, data: any) => adminApi.put(`/subscriptions/admin/${id}`, data),
    delete: (id: number) => adminApi.delete(`/subscriptions/admin/${id}`),
    getStats: () => adminApi.get('/subscriptions/admin/stats'),
    getTransactions: (page: number = 1, limit: number = 50) =>
      adminApi.get('/subscriptions/admin/transactions', { params: { page, limit } }),
  },
};

// Simplified exports for convenience
export default {
  // Auth
  login: (email: string, password: string) =>
    adminApiService.auth.login({ email, password }).then(res => res.data),
  
  // Users
  getAllUsers: (params?: any) =>
    adminApiService.users.getAll(params).then(res => res.data),
  getUserById: (id: string) =>
    adminApiService.users.getById(id).then(res => res.data),
  updateUser: (id: string, data: any) =>
    adminApiService.users.update(id, data).then(res => res.data),
  deleteUser: (id: string) =>
    adminApiService.users.delete(id).then(res => res.data),
  
  // Subscriptions
  getAllSubscriptions: (page?: number, limit?: number) =>
    adminApiService.subscriptions.getAll(page, limit).then(res => res.data),
  getSubscriptionById: (id: number) =>
    adminApiService.subscriptions.getById(id).then(res => res.data),
  createSubscription: (data: any) =>
    adminApiService.subscriptions.create(data).then(res => res.data),
  updateSubscription: (id: number, data: any) =>
    adminApiService.subscriptions.update(id, data).then(res => res.data),
  deleteSubscription: (id: number) =>
    adminApiService.subscriptions.delete(id).then(res => res.data),
  getSubscriptionStats: () =>
    adminApiService.subscriptions.getStats().then(res => res.data),
  getAllTransactions: (page?: number, limit?: number) =>
    adminApiService.subscriptions.getTransactions(page, limit).then(res => res.data),
};
