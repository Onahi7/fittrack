import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';

interface ActivityData {
  date: string;
  meals: number;
  waterGlasses: number;
  journalEntries: number;
  totalActivities: number;
  completionRate: number;
}

interface DailyGoals {
  meals: number; // target meals per day
  waterGlasses: number; // target water glasses per day
  journalEntries: number; // target journal entries per day (1)
}

const DEFAULT_GOALS: DailyGoals = {
  meals: 3, // breakfast, lunch, dinner
  waterGlasses: 8, // 8 glasses of water
  journalEntries: 1 // 1 journal entry
};

export function useActivityData(timeframe: string = '3M') {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  const timeframeDays = useMemo(() => {
    switch (timeframe) {
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 90;
    }
  }, [timeframe]);

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, timeframeDays - 1);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [timeframeDays]);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        // Fetch data for all days in the range
        const promises = dateRange.map(async (date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          try {
            // Fetch meals for this date
            const mealsResponse = await api.meals.getByDate(dateStr);
            const meals = Array.isArray(mealsResponse.data) ? mealsResponse.data : [];
            
            // Fetch water logs for this date
            const waterResponse = await api.water.getByDate(dateStr);
            const waterData = waterResponse.data;
            const waterGlasses = waterData?.glasses || 0;
            
            // Fetch journal entries for this date
            const journalResponse = await api.journal.getByDate(dateStr);
            const journalEntries = Array.isArray(journalResponse.data) ? journalResponse.data.length : 0;
            
            // Calculate totals and completion rate
            const totalActivities = meals.length + (waterGlasses > 0 ? 1 : 0) + journalEntries;
            
            // Calculate completion rate based on daily goals
            const mealCompletion = Math.min(meals.length / DEFAULT_GOALS.meals, 1);
            const waterCompletion = Math.min(waterGlasses / DEFAULT_GOALS.waterGlasses, 1);
            const journalCompletion = Math.min(journalEntries / DEFAULT_GOALS.journalEntries, 1);
            
            const completionRate = ((mealCompletion + waterCompletion + journalCompletion) / 3) * 100;
            
            return {
              date: dateStr,
              meals: meals.length,
              waterGlasses,
              journalEntries,
              totalActivities,
              completionRate
            };
          } catch (error) {
            // If there's an error fetching data for this date, return zero values
            console.error(`Error fetching data for ${dateStr}:`, error);
            return {
              date: dateStr,
              meals: 0,
              waterGlasses: 0,
              journalEntries: 0,
              totalActivities: 0,
              completionRate: 0
            };
          }
        });

        const results = await Promise.all(promises);
        setActivityData(results);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        
        // Set empty data for all dates if there's an error
        const emptyData = dateRange.map(date => ({
          date: format(date, 'yyyy-MM-dd'),
          meals: 0,
          waterGlasses: 0,
          journalEntries: 0,
          totalActivities: 0,
          completionRate: 0
        }));
        setActivityData(emptyData);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [currentUser, timeframeDays, dateRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!activityData.length) {
      return {
        averageCompletionRate: 0,
        totalMeals: 0,
        totalWaterGlasses: 0,
        activeDays: 0,
        bestDay: null,
        streak: 0
      };
    }

    const totalMeals = activityData.reduce((sum, day) => sum + day.meals, 0);
    const totalWaterGlasses = activityData.reduce((sum, day) => sum + day.waterGlasses, 0);
    const averageCompletionRate = activityData.reduce((sum, day) => sum + day.completionRate, 0) / activityData.length;
    const activeDays = activityData.filter(day => day.totalActivities > 0).length;
    
    // Find best day (highest completion rate)
    const bestDay = activityData.reduce((best, day) => 
      day.completionRate > (best?.completionRate || 0) ? day : best, null);
    
    // Calculate current streak (consecutive days with > 50% completion)
    let streak = 0;
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].completionRate >= 50) {
        streak++;
      } else {
        break;
      }
    }

    return {
      averageCompletionRate,
      totalMeals,
      totalWaterGlasses,
      activeDays,
      bestDay,
      streak
    };
  }, [activityData]);

  return {
    activityData,
    loading,
    summaryStats,
    goals: DEFAULT_GOALS
  };
}