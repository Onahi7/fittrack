/**
 * Push Notification Manager
 * Handles browser push notification subscription and management
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

class PushNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Initialize service worker and push notifications
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      // Service worker registered successfully

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      // Service worker registration failed
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    const permission = await Notification.requestPermission();
    // Notification permission checked
    return permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Check if user has granted permission
   */
  hasPermission(): boolean {
    return Notification.permission === 'granted';
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.swRegistration) {
      await this.initialize();
    }

    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      // Subscription check failed
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(authToken: string): Promise<boolean> {
    if (!VAPID_PUBLIC_KEY) {
      // Push notification configuration error
      return false;
    }

    if (!this.swRegistration) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      // Check permission
      if (Notification.permission !== 'granted') {
        const permission = await this.requestPermission();
        if (permission !== 'granted') {
          // Notification permission denied
          return false;
        }
      }

      // Subscribe to push manager
      const subscription = await this.swRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      // Push subscription created successfully

      // Send subscription to backend
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }

      // Subscription saved to server successfully
      return true;
    } catch (error) {
      // Push notification subscription failed
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(authToken: string): Promise<boolean> {
    if (!this.swRegistration) {
      await this.initialize();
    }

    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();
        // Unsubscribed from push manager successfully

        // Remove from backend
        await fetch(`${API_URL}/notifications/unsubscribe`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        // Subscription removed from server successfully
      }

      return true;
    } catch (error) {
      // Push notification unsubscription failed
      return false;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(authToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const data = await response.json();
      // Test notification sent successfully
      return data.success;
    } catch (error) {
      // Test notification failed
      return false;
    }
  }

  /**
   * Convert VAPID key from base64 string to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Export singleton instance
export const pushNotifications = new PushNotificationManager();
