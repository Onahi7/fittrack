import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NotificationPrompt - Prompts users to enable push notifications
 * Shows once per session if notifications aren't enabled
 */
export function NotificationPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const { isSupported, permission, isSubscribed, requestPermission } = usePushNotifications();

  useEffect(() => {
    // Check if user has already dismissed this session
    const sessionDismissed = sessionStorage.getItem('notificationPromptDismissed');
    if (sessionDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      setDismissed(true);
      sessionStorage.setItem('notificationPromptDismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Don't show if:
  // - Not supported
  // - Already subscribed
  // - Permission denied
  // - Already dismissed
  if (!isSupported || isSubscribed || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96"
      >
        <Card className="p-4 shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Stay on Track with Reminders
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get timely notifications for meals, water, and workouts to help you reach your goals.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEnable}
                  className="flex-1"
                >
                  Enable Notifications
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
