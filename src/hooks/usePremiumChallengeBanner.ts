import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Challenge {
  id: number;
  name: string;
  description: string;
  type: string;
  goal: number;
  duration: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  imageUrl?: string;
  isPremiumChallenge: boolean;
}

export const usePremiumChallengeBanner = () => {
  const [currentBanner, setCurrentBanner] = useState<Challenge | null>(null);
  const [availableBanners, setAvailableBanners] = useState<Challenge[]>([]);
  const [lastShownTime, setLastShownTime] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const { currentUser } = useAuth();

  const BANNER_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Fetch available premium banners
  const fetchBanners = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.challenges.getPremiumBanners();
      setAvailableBanners(response.data || []);
    } catch (error) {
      console.error('Error fetching premium banners:', error);
    }
  }, [currentUser]);

  // Track user session
  const trackSession = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      await api.challenges.trackSession();
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  }, [currentUser]);

  // Show banner logic
  const showBanner = useCallback(() => {
    if (availableBanners.length === 0) return;
    
    const now = Date.now();
    const timeSinceLastBanner = now - lastShownTime;
    const timeSinceSessionStart = now - sessionStartTime;
    
    // Don't show banner in first minute of session or if less than 5 minutes since last banner
    if (timeSinceSessionStart < 60 * 1000 || timeSinceLastBanner < BANNER_INTERVAL) {
      return;
    }
    
    // Rotate through available banners
    const currentIndex = availableBanners.findIndex(b => b.id === currentBanner?.id);
    const nextIndex = (currentIndex + 1) % availableBanners.length;
    const nextBanner = availableBanners[nextIndex];
    
    setCurrentBanner(nextBanner);
    setLastShownTime(now);
  }, [availableBanners, currentBanner, lastShownTime, sessionStartTime]);

  // Dismiss banner
  const dismissBanner = useCallback(() => {
    setCurrentBanner(null);
  }, []);

  // Handle banner join (removes from available banners)
  const handleBannerJoin = useCallback(() => {
    if (currentBanner) {
      setAvailableBanners(prev => prev.filter(b => b.id !== currentBanner.id));
      setCurrentBanner(null);
    }
  }, [currentBanner]);

  // Initialize and set up intervals
  useEffect(() => {
    if (!currentUser) return;
    
    fetchBanners();
    trackSession();
    
    // Track session every 30 seconds
    const sessionInterval = setInterval(trackSession, 30 * 1000);
    
    // Check for banner display every minute
    const bannerInterval = setInterval(showBanner, 60 * 1000);
    
    return () => {
      clearInterval(sessionInterval);
      clearInterval(bannerInterval);
    };
  }, [currentUser, fetchBanners, trackSession, showBanner]);

  // Refresh banners when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchBanners();
    } else {
      setAvailableBanners([]);
      setCurrentBanner(null);
    }
  }, [currentUser, fetchBanners]);

  return {
    currentBanner,
    dismissBanner,
    handleBannerJoin,
    refreshBanners: fetchBanners,
  };
};