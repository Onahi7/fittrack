import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface ProgressPhoto {
  id: number;
  url: string;
  cloudinaryPublicId: string;
  date: string;
  weight?: number | string;
  bodyFat?: number | string;
  notes?: string;
  visibility: 'private' | 'buddy' | 'community';
  createdAt: string;
}

export function useProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchPhotos = async () => {
    if (!currentUser) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.photos.getAll();
      setPhotos(response.data || []);
    } catch (err: any) {
      console.error('Error fetching progress photos:', err);
      setError(err?.response?.data?.message || 'Failed to load photos');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const createPhoto = async (photoData: {
    url: string;
    cloudinaryPublicId: string;
    date: string;
    visibility?: 'private' | 'buddy' | 'community';
    notes?: string;
    weight?: number;
    bodyFat?: number;
  }) => {
    try {
      const response = await api.photos.create(photoData);
      const newPhoto = response.data;
      setPhotos(prev => [newPhoto, ...prev]);
      return newPhoto;
    } catch (err: any) {
      console.error('Error creating photo:', err);
      throw new Error(err?.response?.data?.message || 'Failed to save photo');
    }
  };

  const deletePhoto = async (photoId: number) => {
    try {
      await api.photos.delete(photoId);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      throw new Error(err?.response?.data?.message || 'Failed to delete photo');
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [currentUser]);

  return {
    photos,
    loading,
    error,
    createPhoto,
    deletePhoto,
    refetch: fetchPhotos,
  };
}