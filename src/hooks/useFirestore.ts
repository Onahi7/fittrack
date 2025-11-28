import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// Types
export interface Meal {
  id: number;
  userId: string;
  type: string;
  imageUrl?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: number;
  userId: string;
  mood?: string;
  energy?: number;
  sleep?: number;
  notes?: string;
  date: string;
  createdAt: string;
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Hook to manage meals
export function useMeals(date?: Date) {
  const { currentUser, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMeals = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const dateStr = formatDate(date);
      const response = await api.meals.getByDate(dateStr);
      setMeals(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError(err as Error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, date]);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setLoading(false);
      setMeals([]);
      return;
    }

    fetchMeals();
  }, [currentUser, authLoading, fetchMeals]);

  const addNewMeal = async (mealData: {
    type: string;
    imageUrl?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  }) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const response = await api.meals.create({
      ...mealData,
      date: formatDate(date),
    });
    const newMeal = response.data;
    setMeals(prev => [newMeal, ...prev]);
    return newMeal;
  };

  return { meals, loading, error, addMeal: addNewMeal, refetch: fetchMeals };
}

// Hook to manage journal entries
export function useJournal() {
  const { currentUser, loading: authLoading } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntry = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const dateStr = formatDate();
      const response = await api.journal.getByDate(dateStr);
      // Get the first entry for today (or null if none exists)
      const entries = response.data || [];
      setEntry(entries.length > 0 ? entries[0] : null);
      setError(null);
    } catch (err) {
      console.error('Error fetching journal entry:', err);
      setError(err as Error);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setLoading(false);
      setEntry(null);
      return;
    }

    fetchEntry();
  }, [currentUser, authLoading, fetchEntry]);

  const addEntry = async (entryData: {
    mood?: string;
    energy?: number;
    sleep?: number;
    notes?: string;
  }) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const response = await api.journal.create({
      content: entryData.notes || '',
      mood: entryData.mood,
      date: formatDate(),
    });
    const newEntry = response.data;
    setEntry(newEntry);
    return newEntry;
  };

  return { entry, loading, error, addEntry, refetch: fetchEntry };
}

// Hook to manage water intake
export function useWaterTracker() {
  const { currentUser, loading: authLoading } = useAuth();
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWaterIntake = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const dateStr = formatDate();
      const response = await api.water.getByDate(dateStr);
      // Sum up all glasses for today
      const logs = response.data || [];
      const totalGlasses = logs.reduce((sum: number, log: { glasses: number }) => sum + (log.glasses || 0), 0);
      setGlasses(totalGlasses);
      setError(null);
    } catch (err) {
      console.error('Error fetching water intake:', err);
      setError(err as Error);
      setGlasses(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setLoading(false);
      setGlasses(0);
      return;
    }

    fetchWaterIntake();
  }, [currentUser, authLoading, fetchWaterIntake]);

  const updateGlasses = async (newGlasses: number) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    const dateStr = formatDate();
    await api.water.log(newGlasses, dateStr);
    setGlasses(newGlasses);
  };

  const incrementGlasses = async () => {
    if (!currentUser) return;
    const newValue = glasses + 1;
    try {
      await updateGlasses(newValue);
    } catch (err) {
      console.error('Error incrementing glasses:', err);
    }
  };

  const decrementGlasses = async () => {
    if (!currentUser || glasses <= 0) return;
    const newValue = glasses - 1;
    try {
      await updateGlasses(newValue);
    } catch (err) {
      console.error('Error decrementing glasses:', err);
    }
  };

  return {
    glasses,
    loading,
    error,
    updateGlasses,
    incrementGlasses,
    decrementGlasses,
    refetch: fetchWaterIntake,
  };
}
