import { useState, useEffect } from 'react';
import {
  isPushSupported,
  getPermissionStatus,
  isSubscribed as checkSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
  testNotification as sendTestNotification,
} from '@/lib/push-notifications';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const perm = getPermissionStatus();
        setPermission(perm);

        const subscribed = await checkSubscribed();
        setIsSubscribed(subscribed);
      }
    } catch (error) {
      console.error('Error checking push notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const subscription = await subscribeToPush();
      
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPush();
      
      if (success) {
        setIsSubscribed(false);
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await sendTestNotification();
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    unsubscribe,
    testNotification,
    refresh: checkStatus,
  };
}
