import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MEALS: 'meals',
  JOURNAL_ENTRIES: 'journalEntries',
  WATER_INTAKE: 'waterIntake',
  WEEKLY_CHECKINS: 'weeklyCheckins',
  ACHIEVEMENTS: 'achievements',
} as const;

// Helper function to create a user profile
export async function createUserProfile(userId: string, data: {
  displayName: string;
  email: string;
  createdAt?: unknown;
}) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...data,
    createdAt: data.createdAt || serverTimestamp(),
  }).catch(async () => {
    // If document doesn't exist, create it
    await addDoc(collection(db, COLLECTIONS.USERS), {
      userId,
      ...data,
      createdAt: serverTimestamp(),
    });
  });
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
}

// Meal functions
export async function addMeal(userId: string, mealData: {
  type: string;
  imageUrl?: string;
  calories?: number;
  notes?: string;
}) {
  return await addDoc(collection(db, COLLECTIONS.MEALS), {
    userId,
    ...mealData,
    createdAt: serverTimestamp(),
  });
}

export async function getUserMeals(userId: string, date?: Date) {
  const mealsRef = collection(db, COLLECTIONS.MEALS);
  let q = query(
    mealsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    q = query(
      mealsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
      where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Journal functions
export async function addJournalEntry(userId: string, entryData: {
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
}) {
  const dateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return await addDoc(collection(db, COLLECTIONS.JOURNAL_ENTRIES), {
    userId,
    ...entryData,
    date: dateString, // Add date string for simple equality queries
    createdAt: serverTimestamp(),
  });
}

export async function getTodayJournalEntry(userId: string) {
  const dateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Simple equality query - no composite index required
  const q = query(
    collection(db, COLLECTIONS.JOURNAL_ENTRIES),
    where('userId', '==', userId),
    where('date', '==', dateString),
    limit(1)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}

// Water tracking functions
// Helper to get today's date string (YYYY-MM-DD) for simple equality queries
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns "2025-11-24" format
}

export async function addWaterIntake(userId: string, glasses: number) {
  const dateString = getTodayDateString();

  return await addDoc(collection(db, COLLECTIONS.WATER_INTAKE), {
    userId,
    glasses,
    date: dateString, // Use string for simple equality queries (no index needed)
    createdAt: serverTimestamp(),
  });
}

export async function getTodayWaterIntake(userId: string) {
  const dateString = getTodayDateString();

  // Simple equality query - no composite index required
  const q = query(
    collection(db, COLLECTIONS.WATER_INTAKE),
    where('userId', '==', userId),
    where('date', '==', dateString)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.reduce((total, doc) => total + (doc.data().glasses || 0), 0);
}

export async function updateWaterIntake(userId: string, glasses: number) {
  const dateString = getTodayDateString();

  // Simple equality query - no composite index required
  const q = query(
    collection(db, COLLECTIONS.WATER_INTAKE),
    where('userId', '==', userId),
    where('date', '==', dateString),
    limit(1)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.docs[0]) {
    const docRef = doc(db, COLLECTIONS.WATER_INTAKE, snapshot.docs[0].id);
    await updateDoc(docRef, { glasses });
  } else {
    await addWaterIntake(userId, glasses);
  }
}
