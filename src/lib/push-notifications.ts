import { api } from './api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Register service worker
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    // Service Worker registered successfully
    return registration;
  } catch (error) {
    // Service Worker registration failed
    throw error;
  }
}

/**
 * Request notification permission from user
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  const permission = await Notification.requestPermission();
  // Notification permission checked
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.error('Push notifications not supported');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    // Push notification configuration error
    return null;
  }

  try {
    // Request permission first
    const permission = await requestPermission();
    if (permission !== 'granted') {
      // Notification permission not granted
      return null;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Push subscription created successfully
    } else {
      // Already subscribed to push notifications
    }

    // Send subscription to backend
    await saveSubscription(subscription);

    return subscription;
  } catch (error) {
    // Push subscription error
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // No active subscription found
      return true;
    }

    // Unsubscribe from push
    const success = await subscription.unsubscribe();

    if (success) {
      // Remove from backend
      await removeSubscription(subscription.endpoint);
      // Unsubscribed from push notifications successfully
    }

    return success;
  } catch (error) {
    // Push unsubscription error
    return false;
  }
}

/**
 * Save subscription to backend
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  try {
    const subscriptionObject = subscription.toJSON();
    
    await api.notifications.subscribe({
      subscription: {
        endpoint: subscriptionObject.endpoint,
        keys: {
          p256dh: subscriptionObject.keys?.p256dh,
          auth: subscriptionObject.keys?.auth,
        },
      },
    });

    // Subscription saved to backend successfully
  } catch (error) {
    // Backend subscription save failed
    throw error;
  }
}

/**
 * Remove subscription from backend
 */
async function removeSubscription(endpoint: string): Promise<void> {
  try {
    await api.notifications.unsubscribe({ endpoint });
    // Subscription removed from backend successfully
  } catch (error) {
    // Backend subscription removal failed
    throw error;
  }
}

/**
 * Test push notification (for debugging)
 */
export async function testNotification(): Promise<void> {
  try {
    const response = await api.notifications.test();
    // Test notification sent successfully
  } catch (error) {
    // Test notification error
    throw error;
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<any> {
  try {
    const response = await api.notifications.getPreferences();
    return response.data;
  } catch (error) {
    // Notification preferences error
    throw error;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(preferences: any): Promise<void> {
  try {
    await api.notifications.updatePreferences(preferences);
    // Notification preferences updated successfully
  } catch (error) {
    // Notification preferences update error
    throw error;
  }
}
