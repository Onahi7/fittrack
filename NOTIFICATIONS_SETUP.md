import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  reminderTimes: string[]; // e.g., ['09:00', '13:00', '18:00']
  timezone: string;
}

// Initialize push notifications for mobile
export async function initializePushNotifications() {
  if (!isNative) {
    // Web-based FCM
    return initializeWebPushNotifications();
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    // Register with FCM
    await PushNotifications.register();

    // Listen for registration
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Save token to user profile in Firestore
      await saveFCMToken(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
    });

    // Listen for notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
    });

    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
}

// Web push notifications using FCM
async function initializeWebPushNotifications() {
  try {
    const messaging = getMessaging(app);
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console → Project Settings → Cloud Messaging
    });

    console.log('FCM Token:', token);
    await saveFCMToken(token);

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Show notification
      new Notification(payload.notification?.title || 'Intentional', {
        body: payload.notification?.body,
        icon: '/logo.png'
      });
    });

    return true;
  } catch (error) {
    console.error('Error initializing web push:', error);
    return false;
  }
}

// Save FCM token to user profile
async function saveFCMToken(token: string) {
  const { updateUserProfile } = await import('./userProfile');
  const { useAuth } = await import('@/contexts/AuthContext');
  
  // Get current user (you'll need to pass userId from context)
  // This is a placeholder - implement based on your auth context
  try {
    await updateUserProfile('userId', {
      fcmToken: token,
      updatedAt: new Date()
    });
    console.log('FCM token saved to user profile');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

// Schedule local notifications (for meal reminders, water, etc.)
export async function scheduleLocalNotification(
  title: string,
  body: string,
  scheduledTime: Date
) {
  if (!isNative) {
    console.log('Local notifications only work on native mobile apps');
    return;
  }

  try {
    await PushNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: scheduledTime },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
    console.log('Local notification scheduled');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Schedule daily reminders
export async function scheduleDailyReminders(reminderTimes: string[]) {
  const now = new Date();
  
  for (const time of reminderTimes) {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    await scheduleLocalNotification(
      '🌟 Intentional Reminder',
      'Time to log your meal and track your progress!',
      scheduledDate
    );
  }
}

// WhatsApp notification (requires backend)
export async function sendWhatsAppReminder(phoneNumber: string, message: string) {
  // This calls your Firebase Cloud Function
  try {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions(app);
    const sendWhatsApp = httpsCallable(functions, 'sendWhatsAppReminder');
    
    const result = await sendWhatsApp({ phoneNumber, message });
    console.log('WhatsApp sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    throw error;
  }
}
