import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Mail, MessageSquare, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

interface NotificationSettings {
  push: {
    enabled: boolean;
    mealReminders: boolean;
    waterReminders: boolean;
    journalPrompts: boolean;
    achievements: boolean;
    buddyActivity: boolean;
    weeklyCheckIn: boolean;
  };
  email: {
    enabled: boolean;
    weeklyReports: boolean;
    motivationalQuotes: boolean;
    newFeatures: boolean;
    communityUpdates: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  push: {
    enabled: true,
    mealReminders: true,
    waterReminders: true,
    journalPrompts: true,
    achievements: true,
    buddyActivity: true,
    weeklyCheckIn: true,
  },
  email: {
    enabled: true,
    weeklyReports: true,
    motivationalQuotes: true,
    newFeatures: true,
    communityUpdates: false,
  },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from backend first, then fallback to localStorage
    const loadSettings = async () => {
      try {
        if (currentUser?.uid) {
          const profile = await getUserProfile(currentUser.uid);
          if (profile?.notifications) {
            // Map backend notification settings to local state
            setSettings({
              push: {
                enabled: profile.notifications.dailyReminder ?? true,
                mealReminders: profile.notifications.mealReminder ?? true,
                waterReminders: true, // Not in backend yet
                journalPrompts: true, // Not in backend yet
                achievements: profile.notifications.achievements ?? true,
                buddyActivity: profile.notifications.communityActivity ?? true,
                weeklyCheckIn: profile.notifications.weeklyCheckIn ?? true,
              },
              email: {
                enabled: true,
                weeklyReports: true,
                motivationalQuotes: true,
                newFeatures: true,
                communityUpdates: false,
              },
            });
            return;
          }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
        // Fallback to localStorage on error
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      }
    };
    loadSettings();
  }, [currentUser]);

  const handleToggle = (category: 'push' | 'email', key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for immediate access
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Save to backend API if user is authenticated
      if (currentUser?.uid) {
        await updateUserProfile(currentUser.uid, {
          notifications: {
            dailyReminder: settings.push.enabled,
            weeklyCheckIn: settings.push.weeklyCheckIn,
            mealReminder: settings.push.mealReminders,
            achievements: settings.push.achievements,
            communityActivity: settings.push.buddyActivity,
          },
        });
      }
      
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <Button variant="ghost" size="icon" className="mb-4" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold font-heading">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage your notification preferences</p>
        </div>

        <div className="px-6 space-y-6">
          {/* Push Notifications */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold font-heading">Push Notifications</h2>
                <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
              </div>
              <Switch
                checked={settings.push.enabled}
                onCheckedChange={() => handleToggle('push', 'enabled')}
              />
            </div>
            
            <div className="space-y-4">
              <Separator className="bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="meal-reminders">Meal Reminders</Label>
                </div>
                <Switch
                  id="meal-reminders"
                  checked={settings.push.mealReminders}
                  onCheckedChange={() => handleToggle('push', 'mealReminders')}
                  disabled={!settings.push.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="water-reminders">Water Reminders</Label>
                </div>
                <Switch
                  id="water-reminders"
                  checked={settings.push.waterReminders}
                  onCheckedChange={() => handleToggle('push', 'waterReminders')}
                  disabled={!settings.push.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="journal-prompts">Journal Prompts</Label>
                </div>
                <Switch
                  id="journal-prompts"
                  checked={settings.push.journalPrompts}
                  onCheckedChange={() => handleToggle('push', 'journalPrompts')}
                  disabled={!settings.push.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="achievements">Achievement Unlocked</Label>
                </div>
                <Switch
                  id="achievements"
                  checked={settings.push.achievements}
                  onCheckedChange={() => handleToggle('push', 'achievements')}
                  disabled={!settings.push.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="buddy-activity">Buddy Activity</Label>
                </div>
                <Switch
                  id="buddy-activity"
                  checked={settings.push.buddyActivity}
                  onCheckedChange={() => handleToggle('push', 'buddyActivity')}
                  disabled={!settings.push.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="weekly-checkin">Weekly Check-in Reminder</Label>
                </div>
                <Switch
                  id="weekly-checkin"
                  checked={settings.push.weeklyCheckIn}
                  onCheckedChange={() => handleToggle('push', 'weeklyCheckIn')}
                  disabled={!settings.push.enabled}
                />
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold font-heading">Email Notifications</h2>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.email.enabled}
                onCheckedChange={() => handleToggle('email', 'enabled')}
              />
            </div>
            
            <div className="space-y-4">
              <Separator className="bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="weekly-reports">Weekly Progress Reports</Label>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={settings.email.weeklyReports}
                  onCheckedChange={() => handleToggle('email', 'weeklyReports')}
                  disabled={!settings.email.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="motivational-quotes">Motivational Quotes</Label>
                </div>
                <Switch
                  id="motivational-quotes"
                  checked={settings.email.motivationalQuotes}
                  onCheckedChange={() => handleToggle('email', 'motivationalQuotes')}
                  disabled={!settings.email.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="new-features">New Features & Updates</Label>
                </div>
                <Switch
                  id="new-features"
                  checked={settings.email.newFeatures}
                  onCheckedChange={() => handleToggle('email', 'newFeatures')}
                  disabled={!settings.email.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="community-updates">Community Updates</Label>
                </div>
                <Switch
                  id="community-updates"
                  checked={settings.email.communityUpdates}
                  onCheckedChange={() => handleToggle('email', 'communityUpdates')}
                  disabled={!settings.email.enabled}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full h-14 rounded-2xl shadow-glow text-lg font-semibold"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
}
