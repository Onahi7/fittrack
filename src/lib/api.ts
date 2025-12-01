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
    exportData: () => apiClient.get('/users/me/export'),
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
    useFreeze: (type: string) => apiClient.post('/streaks/freeze', { type }),
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

  // Posts
  posts: {
    create: (data: { content: string; imageUrl?: string }) =>
      apiClient.post('/posts', data),
    getAll: (limit?: number, offset?: number) =>
      apiClient.get('/posts', { params: { limit, offset } }),
    getById: (id: number) => apiClient.get(`/posts/${id}`),
    getByUser: (userId: string, limit?: number, offset?: number) =>
      apiClient.get(`/posts/user/${userId}`, { params: { limit, offset } }),
    like: (id: number) => apiClient.post(`/posts/${id}/like`),
    addComment: (id: number, content: string) =>
      apiClient.post(`/posts/${id}/comment`, { content }),
    getComments: (id: number) => apiClient.get(`/posts/${id}/comments`),
    delete: (id: number) => apiClient.delete(`/posts/${id}`),
  },

  // Challenges
  challenges: {
    create: (data: {
      name: string;
      description: string;
      type: string;
      goal: number;
      duration: number;
      startDate: string;
      imageUrl?: string;
    }) => apiClient.post('/challenges', data),
    createAdminChallenge: (data: FormData | {
      name: string;
      description: string;
      type: string;
      goal: number;
      duration: number;
      startDate: string;
      imageUrl?: string;
      isPremiumChallenge?: boolean;
      requiresSubscription?: boolean;
      subscriptionTier?: string;
      gift30Days?: boolean;
      hasDynamicTasks?: boolean;
      dailyTasks?: any[];
    }) => {
      // If data is FormData, send with multipart/form-data headers
      if (data instanceof FormData) {
        return apiClient.post('/challenges/admin', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      // Otherwise send as JSON
      return apiClient.post('/challenges/admin', data);
    },
    getAll: (limit?: number, offset?: number) =>
      apiClient.get('/challenges', { params: { limit, offset } }),
    getById: (id: number) => apiClient.get(`/challenges/${id}`),
    getUserChallenges: () => apiClient.get('/challenges/my-challenges'),
    join: (id: number) => apiClient.post(`/challenges/${id}/join`),
    updateProgress: (id: number, progress: number) =>
      apiClient.put(`/challenges/${id}/progress`, { progress }),
    syncProgress: (id: number, date?: string) =>
      apiClient.post(`/challenges/${id}/sync`, { date }),
    getProgress: (id: number) =>
      apiClient.get(`/challenges/${id}/progress`),
    getLeaderboard: (id: number) =>
      apiClient.get(`/challenges/${id}/leaderboard`),
    getPremiumBanners: () => apiClient.get('/challenges/premium-banners'),
    dismissBanner: (id: number) => apiClient.post(`/challenges/${id}/dismiss-banner`),
    trackSession: () => apiClient.post('/challenges/track-session'),
    getTasks: (challengeId: number, day?: number) =>
      apiClient.get(`/challenges/${challengeId}/tasks`, { params: { day } }),
    completeTask: (challengeId: number, taskId: number, data: { actualValue?: number; notes?: string }) =>
      apiClient.post(`/challenges/${challengeId}/tasks/${taskId}/complete`, data),
    getMyCompletions: (challengeId: number, date?: string) =>
      apiClient.get(`/challenges/${challengeId}/my-completions`, { params: { date } }),
    activateFasting: (challengeId: number, fastingType: string) =>
      apiClient.post(`/challenges/${challengeId}/activate-fasting`, { fastingType }),
  },

  // Groups
  groups: {
    create: (data: {
      name: string;
      description: string;
      category: string;
      imageUrl?: string;
      isPrivate?: boolean;
    }) => apiClient.post('/groups', data),
    getAll: (limit?: number, offset?: number) =>
      apiClient.get('/groups', { params: { limit, offset } }),
    getById: (id: number) => apiClient.get(`/groups/${id}`),
    getUserGroups: () => apiClient.get('/groups/my-groups'),
    join: (id: number) => apiClient.post(`/groups/${id}/join`),
    leave: (id: number) => apiClient.delete(`/groups/${id}/leave`),
    getMembers: (id: number) => apiClient.get(`/groups/${id}/members`),
  },

  // Progress Photos
  photos: {
    create: (data: {
      url: string;
      cloudinaryPublicId: string;
      date: string;
      visibility?: 'private' | 'buddy' | 'community';
      notes?: string;
      weight?: number;
      bodyFat?: number;
    }) => apiClient.post('/photos', data),
    getAll: () => apiClient.get('/photos'),
    getById: (id: number) => apiClient.get(`/photos/${id}`),
    delete: (id: number) => apiClient.delete(`/photos/${id}`),
  },

  // Notifications
  notifications: {
    subscribe: (data: any) => apiClient.post('/notifications/subscribe', data),
    unsubscribe: (data: any) => apiClient.delete('/notifications/unsubscribe', { data }),
    test: () => apiClient.post('/notifications/test'),
    getPreferences: () => apiClient.get('/notifications/preferences'),
    updatePreferences: (data: any) => apiClient.put('/notifications/preferences', data),
  },
};

export default apiClient;
