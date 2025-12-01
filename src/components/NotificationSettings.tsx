import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/push-notifications';
import { Bell, BellOff, Droplet, Utensils, Dumbbell, Flame, Loader2 } from 'lucide-react';

export function NotificationSettings() {
  const { toast } = useToast();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading: pushLoading,
    requestPermission,
    unsubscribe,
    testNotification,
  } = usePushNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    emailEnabled: true,
    waterReminders: true,
    mealReminders: true,
    workoutReminders: false,
    streakReminders: true,
    waterReminderTimes: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    mealReminderTimes: ['08:00', '12:00', '18:00'],
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPrefs: any) => {
    setSaving(true);
    try {
      await updateNotificationPreferences(newPrefs);
      setPreferences(newPrefs);
      toast({
        title: 'Preferences saved',
        description: 'Your notification settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error saving preferences',
        description: 'Failed to update notification settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
  };

  const handleEnableNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      toast({
        title: 'Notifications enabled!',
        description: 'You will now receive push notifications.',
      });
      await loadPreferences();
    } else {
      toast({
        title: 'Permission denied',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  const handleDisableNotifications = async () => {
    const success = await unsubscribe();
    if (success) {
      toast({
        title: 'Notifications disabled',
        description: 'You will no longer receive push notifications.',
      });
    }
  };

  const handleTest = async () => {
    const success = await testNotification();
    if (success) {
      toast({
        title: 'Test notification sent!',
        description: 'Check if you received it.',
      });
    } else {
      toast({
        title: 'Test failed',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Notifications Not Supported</h3>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications.
            Try using Chrome, Firefox, or Edge.
          </p>
        </div>
      </Card>
    );
  }

  if (loading || pushLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2">Loading notification settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Notifications */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isSubscribed ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <Bell className={`w-6 h-6 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? 'You will receive browser notifications'
                  : 'Enable to receive reminders in your browser'}
              </p>
            </div>
          </div>
        </div>

        {!isSubscribed ? (
          <Button
            onClick={handleEnableNotifications}
            className="w-full"
            disabled={permission === 'denied'}
          >
            {permission === 'denied' ? 'Permission Denied' : 'Enable Notifications'}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleTest}
              variant="outline"
              className="w-full"
            >
              Test Notification
            </Button>
            <Button
              onClick={handleDisableNotifications}
              variant="destructive"
              className="w-full"
            >
              Disable Notifications
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <p className="text-xs text-destructive mt-2">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </Card>

      {/* Notification Types */}
      {isSubscribed && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reminder Types</h3>
          <div className="space-y-4">
            {/* Water Reminders */}
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Label className="font-medium">Water Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Reminds you to drink water throughout the day
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.waterReminders}
                onCheckedChange={(checked) => handleToggle('waterReminders', checked)}
                disabled={saving}
              />
            </div>

            {/* Meal Reminders */}
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <Label className="font-medium">Meal Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Reminds you to log your meals
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.mealReminders}
                onCheckedChange={(checked) => handleToggle('mealReminders', checked)}
                disabled={saving}
              />
            </div>

            {/* Workout Reminders */}
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <Label className="font-medium">Workout Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Reminds you to exercise
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.workoutReminders}
                onCheckedChange={(checked) => handleToggle('workoutReminders', checked)}
                disabled={saving}
              />
            </div>

            {/* Streak Reminders */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <Label className="font-medium">Streak Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Reminds you to maintain your streak
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.streakReminders}
                onCheckedChange={(checked) => handleToggle('streakReminders', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          About Notifications
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 100% free - no messaging costs</li>
          <li>• Works even when browser is closed (desktop)</li>
          <li>• Customize times in your preferences</li>
          <li>• Can be disabled anytime</li>
        </ul>
      </Card>
    </div>
  );
}
