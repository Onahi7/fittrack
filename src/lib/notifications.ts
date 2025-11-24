import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const isNative = Capacitor.isNativePlatform();

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  reminderTimes: string[]; // e.g., ['09:00', '13:00', '18:00']
  timezone: string;
}

// Initialize local notifications
export async function initializeLocalNotifications() {
  if (!isNative) {
    console.log('Local notifications only work on native mobile apps');
    return false;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error initializing local notifications:', error);
    return false;
  }
}

// Schedule a single notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  scheduledTime: Date,
  id?: number
) {
  if (!isNative) {
    console.log('Local notifications only work on native mobile apps');
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: id || Date.now(),
          schedule: { at: scheduledTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
    console.log('Notification scheduled for', scheduledTime);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Schedule daily meal reminders
export async function scheduleMealReminders(reminderTimes: string[]) {
  if (!isNative) return;

  const reminders = [
    { time: reminderTimes[0] || '08:00', title: '🌅 Good Morning!', body: 'Log your breakfast and start your day right' },
    { time: reminderTimes[1] || '12:00', title: '🍽️ Lunch Time!', body: "Don't forget to log your lunch" },
    { time: reminderTimes[2] || '18:00', title: '🌙 Dinner Time!', body: 'Time to log your dinner and review your progress' }
  ];

  const now = new Date();
  
  for (let i = 0; i < reminders.length; i++) {
    const { time, title, body } = reminders[i];
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    await scheduleLocalNotification(title, body, scheduledDate, 1000 + i);
  }
}

// Schedule water reminders (every 2 hours)
export async function scheduleWaterReminders(startHour = 8, endHour = 20) {
  if (!isNative) return;

  const now = new Date();
  let notificationId = 2000;
  
  for (let hour = startHour; hour <= endHour; hour += 2) {
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, 0, 0, 0);
    
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    await scheduleLocalNotification(
      '💧 Hydration Check',
      'Time to drink some water!',
      scheduledDate,
      notificationId++
    );
  }
}

// Clear all scheduled notifications
export async function clearAllNotifications() {
  if (!isNative) return;

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
      console.log('Cleared all notifications');
    }
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

// Reschedule all notifications (call when user updates preferences)
export async function rescheduleNotifications(preferences: NotificationPreferences) {
  await clearAllNotifications();
  
  if (preferences.push) {
    await scheduleMealReminders(preferences.reminderTimes);
    await scheduleWaterReminders();
  }
}
