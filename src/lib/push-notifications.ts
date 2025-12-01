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
    console.log('✅ Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
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
  console.log('Notification permission:', permission);
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
    console.error('VAPID_PUBLIC_KEY not configured. Add VITE_VAPID_PUBLIC_KEY to .env');
    return null;
  }

  try {
    // Request permission first
    const permission = await requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
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

      console.log('✅ Push subscription created:', subscription);
    } else {
      console.log('✅ Already subscribed:', subscription);
    }

    // Send subscription to backend
    await saveSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
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
      console.log('No subscription to unsubscribe from');
      return true;
    }

    // Unsubscribe from push
    const success = await subscription.unsubscribe();

    if (success) {
      // Remove from backend
      await removeSubscription(subscription.endpoint);
      console.log('✅ Unsubscribed from push notifications');
    }

    return success;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
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

    console.log('✅ Subscription saved to backend');
  } catch (error) {
    console.error('❌ Failed to save subscription to backend:', error);
    throw error;
  }
}

/**
 * Remove subscription from backend
 */
async function removeSubscription(endpoint: string): Promise<void> {
  try {
    await api.notifications.unsubscribe({ endpoint });
    console.log('✅ Subscription removed from backend');
  } catch (error) {
    console.error('❌ Failed to remove subscription from backend:', error);
    throw error;
  }
}

/**
 * Test push notification (for debugging)
 */
export async function testNotification(): Promise<void> {
  try {
    const response = await api.notifications.test();
    console.log('Test notification sent:', response.data);
  } catch (error) {
    console.error('Failed to send test notification:', error);
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
    console.error('Failed to get notification preferences:', error);
    throw error;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(preferences: any): Promise<void> {
  try {
    await api.notifications.updatePreferences(preferences);
    console.log('✅ Notification preferences updated');
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
}
