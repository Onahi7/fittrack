import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { useUserProfile } from '@/hooks/useUserProfile';
import { subDays, format, parseISO } from 'date-fns';

interface WeightDataPoint {
  date: string;
  weight: number;
  source: 'profile' | 'photo' | 'checkin';
}

export function useWeightData(timeframe: string = '3M') {
  const { currentUser } = useAuth();
  const { photos } = useProgressPhotos();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);

  const timeframeDays = useMemo(() => {
    switch (timeframe) {
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 90;
    }
  }, [timeframe]);

  const weightData = useMemo(() => {
    if (!currentUser) return [];

    const data: WeightDataPoint[] = [];
    const cutoffDate = subDays(new Date(), timeframeDays);

    // Add profile weights (current and starting)
    if (profile?.startingWeight && profile.createdAt) {
      const startDate = new Date(profile.createdAt);
      if (startDate >= cutoffDate) {
        data.push({
          date: format(startDate, 'yyyy-MM-dd'),
          weight: typeof profile.startingWeight === 'string' ? parseFloat(profile.startingWeight) : profile.startingWeight,
          source: 'profile'
        });
      }
    }

    // Add current weight from profile if updated recently
    if (profile?.currentWeight && profile.updatedAt) {
      const updateDate = new Date(profile.updatedAt);
      if (updateDate >= cutoffDate) {
        data.push({
          date: format(updateDate, 'yyyy-MM-dd'),
          weight: typeof profile.currentWeight === 'string' ? parseFloat(profile.currentWeight) : profile.currentWeight,
          source: 'profile'
        });
      }
    }

    // Add weights from progress photos
    photos.forEach(photo => {
      if (photo.weight) {
        const photoDate = new Date(photo.date);
        if (photoDate >= cutoffDate) {
          const weight = typeof photo.weight === 'string' ? parseFloat(photo.weight) : photo.weight;
          if (!isNaN(weight)) {
            data.push({
              date: format(photoDate, 'yyyy-MM-dd'),
              weight,
              source: 'photo'
            });
          }
        }
      }
    });

    // Remove duplicates and sort by date
    const uniqueData = data.reduce((acc, current) => {
      const existing = acc.find(item => item.date === current.date);
      if (!existing) {
        acc.push(current);
      } else {
        // Prefer more recent source types: checkin > photo > profile
        const sourcePriority = { checkin: 3, photo: 2, profile: 1 };
        if (sourcePriority[current.source] > sourcePriority[existing.source]) {
          Object.assign(existing, current);
        }
      }
      return acc;
    }, [] as WeightDataPoint[]);

    return uniqueData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [profile, photos, timeframeDays, currentUser]);

  const finalWeightData = useMemo(() => {
    return weightData;
  }, [weightData]);

  useEffect(() => {
    setLoading(false);
  }, [finalWeightData]);

  return {
    weightData: finalWeightData,
    loading,
    goalWeight: profile?.goalWeight ? 
      (typeof profile.goalWeight === 'string' ? parseFloat(profile.goalWeight) : profile.goalWeight) : 
      undefined
  };
}