import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'meals/userId/filename.jpg')
 * @returns The download URL of the uploaded file
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Upload a meal image
 * @param userId - The user's ID
 * @param file - The image file
 * @returns The download URL
 */
export async function uploadMealImage(userId: string, file: File): Promise<string> {
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const path = `meals/${userId}/${filename}`;
  return uploadFile(file, path);
}

/**
 * Upload a profile picture
 * @param userId - The user's ID
 * @param file - The image file
 * @returns The download URL
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  const path = `profiles/${userId}/avatar.jpg`;
  return uploadFile(file, path);
}

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL or storage path
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    // File deletion error
  }
}

/**
 * Convert a file to base64 for preview
 * @param file - The file to convert
 * @returns Promise resolving to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
