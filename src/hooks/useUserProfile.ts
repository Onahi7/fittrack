import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/userProfile';

export function useUserProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      await updateUserProfile(currentUser.uid, updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}
