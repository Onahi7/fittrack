/**
 * Cloudinary Image Upload Utilities
 * 
 * Provides functions to upload images to Cloudinary using unsigned upload presets.
 * Free tier: 25GB storage, 25GB bandwidth/month
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const MEAL_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'intentional-meals';
const PROFILE_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET || 'intentional-profiles';
const POST_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_POST_PRESET || 'intentional-posts';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

/**
 * Validates if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env');
    return false;
  }
  return true;
}

/**
 * Validates file before upload
 */
function validateFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPG, PNG, WEBP, or HEIC)');
  }
}

/**
 * Generic upload function to Cloudinary
 */
async function uploadToCloudinary(
  file: File,
  uploadPreset: string,
  folder: string
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Please add credentials to .env');
  }

  validateFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('quality', 'auto:good');
  formData.append('fetch_format', 'auto');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
    );
  }
}

/**
 * Upload a meal image
 * @param file Image file to upload
 * @param userId User ID (for organizing uploads)
 * @returns Cloudinary URL of the uploaded image
 */
export async function uploadMealImage(file: File, userId?: string): Promise<string> {
  const folder = userId ? `intentional/meals/${userId}` : 'intentional/meals';
  return uploadToCloudinary(file, MEAL_UPLOAD_PRESET, folder);
}

/**
 * Upload a profile picture
 * @param file Image file to upload
 * @param userId User ID
 * @returns Cloudinary URL of the uploaded image
 */
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const folder = `intentional/profiles`;
  return uploadToCloudinary(file, PROFILE_UPLOAD_PRESET, folder);
}

/**
 * Upload a community post image
 * @param file Image file to upload
 * @param userId User ID (for organizing uploads)
 * @returns Cloudinary URL of the uploaded image
 */
export async function uploadPostImage(file: File, userId?: string): Promise<string> {
  const folder = userId ? `intentional/posts/${userId}` : 'intentional/posts';
  return uploadToCloudinary(file, POST_UPLOAD_PRESET, folder);
}

/**
 * Get optimized image URL with transformations
 * @param url Original Cloudinary URL
 * @param options Transformation options
 * @returns Transformed URL
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  } = {}
): string {
  if (!url.includes('cloudinary.com')) {
    return url; // Not a Cloudinary URL
  }

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);

  // Add automatic format optimization
  transformations.push('f_auto');

  const transformString = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Get thumbnail URL (200x200)
 */
export function getThumbnailUrl(url: string): string {
  return getOptimizedImageUrl(url, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto:good',
  });
}

/**
 * Get responsive image URLs
 */
export function getResponsiveUrls(url: string): {
  small: string;
  medium: string;
  large: string;
} {
  return {
    small: getOptimizedImageUrl(url, { width: 400, quality: 'auto:good' }),
    medium: getOptimizedImageUrl(url, { width: 800, quality: 'auto:good' }),
    large: getOptimizedImageUrl(url, { width: 1200, quality: 'auto:good' }),
  };
}

/**
 * Delete an image from Cloudinary (requires backend API with credentials)
 * Note: This needs to be done from a backend to keep API secret secure
 */
export function getDeleteInstructions(publicId: string): string {
  return `To delete this image, use the Cloudinary API from your backend with public_id: ${publicId}`;
}
