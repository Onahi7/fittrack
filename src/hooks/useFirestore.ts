import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  addMeal,
  getUserMeals,
  addJournalEntry,
  getTodayJournalEntry,
  getTodayWaterIntake,
  updateWaterIntake,
} from '@/lib/firestore';
import type { Meal, JournalEntry } from '@/types/firestore';

// Hook to manage meals
export function useMeals(date?: Date) {
  const { currentUser, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }

    if (!currentUser) {
      setLoading(false);
      setMeals([]);
      return;
    }

    let isMounted = true;

    const fetchMeals = async () => {
      try {
        setLoading(true);
        const fetchedMeals = await getUserMeals(currentUser.uid, date);
        if (isMounted) {
          setMeals(fetchedMeals as Meal[]);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMeals();

    return () => {
      isMounted = false;
    };
  }, [currentUser, authLoading, date]);

  const addNewMeal = async (mealData: {
    type: string;
    imageUrl?: string;
    calories?: number;
    notes?: string;
  }) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const docRef = await addMeal(currentUser.uid, mealData);
    const newMeal = { id: docRef.id, ...mealData, userId: currentUser.uid };
    setMeals(prev => [newMeal, ...prev]);
    return docRef;
  };

  return { meals, loading, error, addMeal: addNewMeal, refetch: () => getUserMeals(currentUser?.uid || '', date) };
}

// Hook to manage journal entries
export function useJournal() {
  const { currentUser, loading: authLoading } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }

    if (!currentUser) {
      setLoading(false);
      setEntry(null);
      return;
    }

    let isMounted = true;

    const fetchEntry = async () => {
      try {
        setLoading(true);
        const todayEntry = await getTodayJournalEntry(currentUser.uid);
        if (isMounted) {
          setEntry(todayEntry as JournalEntry | null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEntry();

    return () => {
      isMounted = false;
    };
  }, [currentUser, authLoading]);

  const addEntry = async (entryData: {
    mood?: string;
    energy?: number;
    sleep?: number;
    notes?: string;
  }) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const docRef = await addJournalEntry(currentUser.uid, entryData);
    const newEntry = { id: docRef.id, ...entryData, userId: currentUser.uid };
    setEntry(newEntry);
    return docRef;
  };

  return { entry, loading, error, addEntry };
}

// Hook to manage water intake
export function useWaterTracker() {
  const { currentUser, loading: authLoading } = useAuth();
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }

    if (!currentUser) {
      setLoading(false);
      setGlasses(0);
      return;
    }

    let isMounted = true;

    const fetchWaterIntake = async () => {
      try {
        setLoading(true);
        const todayGlasses = await getTodayWaterIntake(currentUser.uid);
        if (isMounted) {
          setGlasses(todayGlasses);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWaterIntake();

    return () => {
      isMounted = false;
    };
  }, [currentUser, authLoading]);

  const updateGlasses = async (newGlasses: number) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    await updateWaterIntake(currentUser.uid, newGlasses);
    setGlasses(newGlasses);
  };

  const incrementGlasses = () => {
    if (currentUser) {
      const newValue = glasses + 1;
      updateGlasses(newValue);
    }
  };

  const decrementGlasses = () => {
    if (currentUser && glasses > 0) {
      const newValue = glasses - 1;
      updateGlasses(newValue);
    }
  };

  return {
    glasses,
    loading,
    error,
    updateGlasses,
    incrementGlasses,
    decrementGlasses,
  };
}
