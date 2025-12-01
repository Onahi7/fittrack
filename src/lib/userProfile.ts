import { api } from './api';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  // Stats
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  totalMeals: number;
  totalWaterGlasses: number;
  // Goals
  startingWeight?: number;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  dailyWaterGoal: number;
  dailyCalorieGoal?: number;
  dailyMealGoal?: number;
  // Preferences
  notifications?: {
    dailyReminder: boolean;
    weeklyCheckIn: boolean;
    mealReminder: boolean;
    achievements: boolean;
    communityActivity: boolean;
  };
  // New: Advanced Notification Preferences
  whatsappNumber?: string; // Format: +919876543210
  phoneNumber?: string; // For SMS notifications
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    whatsapp: boolean;
    sms: boolean;
    reminderTimes: string[]; // e.g., ['08:00', '12:00', '18:00']
    timezone: string; // e.g., 'Asia/Kolkata'
  };
  fcmToken?: string; // Firebase Cloud Messaging token
  theme: 'light' | 'dark' | 'system';
  // User preferences and settings
  country?: string; // User's country for localized content
  tutorialCompleted?: boolean;
  fastingProtocol?: string;
  fastingStartTime?: string | Date;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  lastCheckInDate?: string;
  setupCompleted?: boolean;
}

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  try {
    await api.users.create({
      id: uid,
      email,
      displayName,
      photoURL,
    });
  } catch (error: any) {
    // User might already exist, that's okay
    if (error?.response?.status !== 409) {
      throw error;
    }
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const response = await api.users.getProfile();
    const profile = response.data;
    
    // Map backend profile to frontend format
    return {
      uid,
      displayName: profile.displayName || '',
      email: profile.email || '',
      photoURL: profile.photoURL,
      bio: profile.bio,
      currentStreak: profile.currentStreak || 0,
      longestStreak: profile.longestStreak || 0,
      totalEntries: profile.totalEntries || 0,
      totalMeals: profile.totalMeals || 0,
      totalWaterGlasses: profile.totalWaterGlasses || 0,
      startingWeight: profile.startingWeight ? Number(profile.startingWeight) : undefined,
      currentWeight: profile.currentWeight ? Number(profile.currentWeight) : undefined,
      goalWeight: profile.goalWeight ? Number(profile.goalWeight) : undefined,
      height: profile.height ? Number(profile.height) : undefined,
      dailyWaterGoal: profile.dailyWaterGoal ? Number(profile.dailyWaterGoal) : 8,
      dailyCalorieGoal: profile.dailyCalorieGoal ? Number(profile.dailyCalorieGoal) : undefined,
      notifications: profile.notifications || {
        dailyReminder: true,
        weeklyCheckIn: true,
        mealReminder: true,
        achievements: true,
        communityActivity: true,
      },
      theme: profile.theme || 'system',
      tutorialCompleted: profile.tutorialCompleted || false,
      fastingProtocol: profile.fastingProtocol || '16:8',
      fastingStartTime: profile.fastingStartTime,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      setupCompleted: profile.setupCompleted,
    };
  } catch (error) {
    // User profile error
    return null;
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await api.users.updateProfile(updates);
}

export async function incrementUserStats(
  uid: string,
  stat: 'totalEntries' | 'totalMeals' | 'totalWaterGlasses',
  amount = 1
): Promise<void> {
  // This will be handled by the backend automatically when logging meals/water
  // Stats update logged to backend only
}

export async function updateStreak(uid: string, currentDate: Date): Promise<void> {
  // This will be handled by the backend streak service
  try {
    await api.streaks.checkIn('daily');
  } catch (error) {
    // Streak update error
  }
}
