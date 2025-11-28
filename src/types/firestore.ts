// Type definitions for Firestore data models

export interface Meal {
  id?: string;
  userId: string;
  type: string;
  imageUrl?: string;
  calories?: number;
  notes?: string;
  createdAt?: any;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
  createdAt?: any;
}

export interface WaterIntake {
  id?: string;
  userId: string;
  glasses: number;
  date: any;
  createdAt?: any;
}

export interface UserProfile {
  id?: string;
  userId: string;
  displayName: string;
  email: string;
  createdAt?: any;
  
  // Profile data
  startingWeight?: number;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  dailyCalorieGoal?: number;
  dailyWaterGoal?: number;
  setupCompleted?: boolean;
  
  // Notification preferences
  notifications?: {
    dailyReminder?: boolean;
    weeklyCheckIn?: boolean;
    mealReminder?: boolean;
    achievements?: boolean;
    communityActivity?: boolean;
  };
  
  // User preferences and settings
  tutorialCompleted?: boolean;
  fastingProtocol?: string;
  fastingStartTime?: string | Date;
}
