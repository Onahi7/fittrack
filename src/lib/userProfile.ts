import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

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
  dailyWaterGoal: number;
  dailyMealGoal: number;
  // Preferences
  notifications: {
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
  // Timestamps
  createdAt?: unknown;
  updatedAt?: unknown;
  lastCheckInDate?: unknown;
}

const USERS_COLLECTION = 'users';

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    bio: '',
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    totalMeals: 0,
    totalWaterGlasses: 0,
    dailyWaterGoal: 8,
    dailyMealGoal: 4,
    notifications: {
      dailyReminder: true,
      weeklyCheckIn: true,
      mealReminder: true,
      achievements: true,
      communityActivity: true,
    },
    theme: 'system',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), userProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  
  return null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function incrementUserStats(
  uid: string,
  stat: 'totalEntries' | 'totalMeals' | 'totalWaterGlasses',
  amount = 1
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    [stat]: increment(amount),
    updatedAt: serverTimestamp(),
  });
}

export async function updateStreak(uid: string, currentDate: Date): Promise<void> {
  const profile = await getUserProfile(uid);
  
  if (!profile) return;

  const lastCheckIn = profile.lastCheckInDate 
    ? new Date((profile.lastCheckInDate as { toDate: () => Date }).toDate()) 
    : null;
  
  let newStreak = profile.currentStreak;
  
  if (lastCheckIn) {
    const daysDiff = Math.floor(
      (currentDate.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    }
    // If daysDiff === 0, same day, no change
  } else {
    // First check-in
    newStreak = 1;
  }

  const longestStreak = Math.max(profile.longestStreak, newStreak);

  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    currentStreak: newStreak,
    longestStreak,
    lastCheckInDate: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
