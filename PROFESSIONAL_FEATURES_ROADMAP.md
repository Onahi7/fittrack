# Professional Features Implementation Roadmap

## Overview
This document outlines the implementation plan for transforming FitTrack into a professional wellness accountability platform with advanced features for user engagement, motivation, and data security.

---

## 🎯 Implementation Phases

### **Phase 1: Core Accountability System** (Week 1-2)
**Priority: CRITICAL** - Foundation for user retention

#### 1.1 Daily Check-In Streaks
**Files to Create/Modify:**
- `src/lib/streaks.ts` - Streak calculation and management
- `src/components/StreakDisplay.tsx` - Visual streak counter
- `src/pages/DailyCheckIn.tsx` - Daily check-in interface
- `src/hooks/useStreaks.ts` - React hook for streak data

**Features:**
- Track consecutive days of logging meals/water/journal
- Calculate streak length and best streak
- Store in Firestore: `users/{userId}/streaks/{type}`
- Visual flame/fire icon with day count
- Streak freeze feature (1 per week)

**Firestore Schema:**
```typescript
interface Streak {
  userId: string;
  type: 'meal' | 'water' | 'journal' | 'overall';
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Timestamp;
  freezeAvailable: boolean;
  streakHistory: { date: string; completed: boolean }[];
}
```

#### 1.2 Missed Check-In Notifications
**Files to Create/Modify:**
- `src/lib/notifications.ts` - Update with check-in reminders
- `src/lib/scheduledJobs.ts` - NEW: Cron-like job scheduler
- `functions/src/checkInReminders.ts` - NEW: Cloud Function

**Features:**
- Daily reminder at user-preferred time (default 8 PM)
- Escalating reminders: 1st miss = gentle, 2nd = urgent, 3rd = streak at risk
- Push notifications (Capacitor Local Notifications)
- Email fallback for critical reminders
- User settings for notification preferences

**Implementation:**
```typescript
// Cloud Function (Firebase Functions)
export const dailyCheckInReminder = functions.pubsub
  .schedule('0 20 * * *') // 8 PM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    // Check users who haven't logged today
    // Send notifications based on streak status
  });
```

#### 1.3 Weekly Progress Reports
**Files to Create/Modify:**
- `src/lib/reports.ts` - Report generation logic
- `src/components/WeeklyReport.tsx` - Report UI component
- `src/lib/email.ts` - Update with report templates
- `functions/src/weeklyReports.ts` - Cloud Function for email delivery

**Features:**
- Auto-generated every Monday at 6 AM
- Include: calories trend, water intake, weight change, streak status
- Comparison with previous week
- Personalized insights (e.g., "You logged 5/7 days this week!")
- Email delivery with beautiful HTML template
- In-app archive of past reports

**Report Data Points:**
- Weight change (start vs end of week)
- Average daily calories
- Water intake compliance (% of days met goal)
- Meal logging frequency
- Journal entries count
- Active streaks

---

### **Phase 2: Accountability Partners & Social** (Week 3-4)
**Priority: HIGH** - Community drives engagement

#### 2.1 Accountability Buddy System
**Files to Create/Modify:**
- `src/pages/FindBuddy.tsx` - Partner matching interface
- `src/pages/BuddyDashboard.tsx` - Shared progress view
- `src/lib/buddySystem.ts` - Pairing logic
- `src/components/BuddyRequest.tsx` - Accept/decline requests

**Firestore Schema:**
```typescript
interface BuddyPair {
  id: string;
  user1: string;
  user2: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: Timestamp;
  sharedGoals: string[];
  canViewProgress: {
    weight: boolean;
    meals: boolean;
    journal: boolean;
  };
}
```

**Features:**
- Search users by goals/timezone
- Send buddy requests
- Shared progress dashboard (with privacy controls)
- Buddy check-ins (nudge partner if inactive)
- Weekly buddy challenges
- Private messaging

#### 2.2 Progress Photos System
**Files to Create/Modify:**
- `src/pages/ProgressPhotos.tsx` - Photo upload/management
- `src/components/PhotoComparison.tsx` - Before/after slider
- `src/lib/cloudinary.ts` - Update with progress photo uploads
- `src/components/PhotoTimeline.tsx` - Chronological photo gallery

**Features:**
- Upload progress photos with date tags
- Before/after comparison slider
- Timeline view (weekly/monthly grid)
- Privacy settings (private/buddy-only/community)
- Photo notes/journal entries
- Body measurements tracker overlay

**Cloudinary Integration:**
```typescript
export const uploadProgressPhoto = async (
  file: File,
  userId: string,
  date: Date,
  visibility: 'private' | 'buddy' | 'community'
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'progress-photos');
  formData.append('folder', `users/${userId}/progress`);
  formData.append('context', `date=${date.toISOString()}|visibility=${visibility}`);
  // ... upload logic
};
```

---

### **Phase 3: Professional UI/UX** (Week 5-6)
**Priority: HIGH** - First impressions matter

#### 3.1 Onboarding Tutorial
**Files to Create/Modify:**
- `src/components/OnboardingTour.tsx` - Interactive walkthrough
- `src/lib/onboarding.ts` - Tour state management
- `src/pages/Setup.tsx` - Update with progressive disclosure

**Features:**
- Step-by-step app tour (use react-joyride or custom)
- Interactive tooltips for key features
- Skip option with "Show tutorial again" in settings
- Progress indicator (Step 1 of 5)
- Completion celebration animation

**Tour Steps:**
1. Welcome message
2. Log your first meal
3. Track water intake
4. Set daily goals
5. Explore community
6. Enable notifications

#### 3.2 Progress Charts & Visualization
**Files to Create/Modify:**
- `src/components/charts/WeightChart.tsx` - Weight trend line
- `src/components/charts/CalorieChart.tsx` - Daily calorie bar chart
- `src/components/charts/WaterChart.tsx` - Water intake area chart
- `src/components/charts/StreakCalendar.tsx` - GitHub-style heatmap
- `src/pages/Analytics.tsx` - Comprehensive dashboard

**Libraries to Install:**
```bash
pnpm add recharts date-fns
pnpm add @types/recharts -D
```

**Features:**
- Weight trend with goal line
- Calorie intake vs target (daily/weekly)
- Water intake compliance calendar
- Streak heatmap (GitHub contribution style)
- Time range selector (7d, 30d, 90d, 1y, All)
- Export chart as image

**Chart Components:**
```typescript
<LineChart data={weightData}>
  <Line dataKey="weight" stroke="#10b981" />
  <Line dataKey="goal" stroke="#6b7280" strokeDasharray="5 5" />
  <XAxis dataKey="date" />
  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
  <Tooltip />
  <Legend />
</LineChart>
```

#### 3.3 Achievement System
**Files to Create/Modify:**
- `src/lib/achievements.ts` - Achievement definitions and triggers
- `src/components/AchievementUnlock.tsx` - Celebration modal
- `src/pages/Achievements.tsx` - Update with progress bars
- `src/hooks/useAchievements.ts` - Achievement tracking hook

**Achievement Categories:**
1. **Streaks**: 3-day, 7-day, 30-day, 100-day warrior
2. **Weight Loss**: First 5 lbs, 10 lbs, 25 lbs, goal reached
3. **Consistency**: 30 meals logged, 100 meals, 365 meals
4. **Hydration**: 7-day water goal, 30-day water goal
5. **Community**: First post, 10 posts, 100 likes given
6. **Journaling**: 7 entries, 30 entries, 365 entries
7. **Special**: Weekend warrior (logged all weekend), Early bird (5 AM workouts)

**Firestore Schema:**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'streak' | 'weight' | 'consistency' | 'community' | 'special';
  icon: string;
  requirement: number;
  unlockedAt?: Timestamp;
  progress: number;
}
```

#### 3.4 Reports Dashboard
**Files to Create/Modify:**
- `src/pages/Reports.tsx` - NEW: Comprehensive reports page
- `src/components/ReportCard.tsx` - Individual report cards
- `src/lib/reportGenerator.ts` - Report calculation logic

**Features:**
- Weekly summary card
- Monthly overview card
- Custom date range reports
- Key metrics: avg calories, weight change, logging frequency
- Insights: "Your best day was Tuesday!" 
- Comparison to previous period
- Share report feature (screenshot or PDF)

#### 3.5 Data Export (PDF)
**Files to Create/Modify:**
- `src/lib/pdfExport.ts` - PDF generation logic
- `src/components/ExportDialog.tsx` - Export options UI

**Libraries to Install:**
```bash
pnpm add jspdf jspdf-autotable
```

**Export Options:**
- Date range selection
- Data types: meals, weight, journal, water
- Format: PDF with charts and tables
- Include progress photos option
- Email to self option

---

### **Phase 4: Motivation & Content** (Week 7-8)
**Priority: MEDIUM** - Enhances engagement

#### 4.1 Daily Motivational Content
**Files to Create/Modify:**
- `src/lib/motivationalContent.ts` - Quote/tip database
- `src/components/DailyQuote.tsx` - Quote card component
- `src/components/TipOfTheDay.tsx` - Educational tip card

**Content Categories:**
1. **Motivational Quotes** (200+ quotes)
2. **Nutrition Tips** (100+ science-backed tips)
3. **Fitness Facts** (50+ exercise insights)
4. **Mindset Lessons** (75+ psychology tips)

**Features:**
- New content daily (rotated, not random)
- Save favorite quotes
- Share quote as image (with branding)
- Notification option for daily quote

**Sample Data Structure:**
```typescript
const quotes = [
  {
    id: 1,
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    category: "motivation",
  },
  // ... 200+ more
];

const nutritionTips = [
  {
    id: 1,
    title: "Protein timing matters",
    content: "Consuming 20-30g protein within 2 hours post-workout maximizes muscle recovery.",
    source: "Journal of the International Society of Sports Nutrition",
    category: "nutrition",
  },
  // ... 100+ more
];
```

#### 4.2 Educational Content Library
**Files to Create/Modify:**
- `src/pages/Learn.tsx` - NEW: Education hub
- `src/components/ArticleCard.tsx` - Content preview cards
- `src/lib/content.ts` - Article database

**Content Structure:**
- Categories: Nutrition, Exercise, Mindset, Sleep, Recovery
- Each article: title, summary, full content, read time, author
- Search functionality
- Bookmark favorites
- Reading progress tracking

#### 4.3 Community Success Stories
**Files to Create/Modify:**
- `src/pages/SuccessStories.tsx` - NEW: Stories showcase
- `src/components/StoryCard.tsx` - Story preview
- `src/components/StorySubmission.tsx` - Submit your story form

**Firestore Schema:**
```typescript
interface SuccessStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  story: string;
  beforePhoto: string;
  afterPhoto: string;
  weightLost: number;
  timeframe: string; // "6 months"
  keyTips: string[];
  createdAt: Timestamp;
  likes: number;
  featured: boolean;
}
```

#### 4.4 Habit Tracking with Insights
**Files to Create/Modify:**
- `src/pages/Habits.tsx` - NEW: Habit tracker
- `src/components/HabitCard.tsx` - Individual habit tracking
- `src/lib/habitInsights.ts` - Data analysis and insights

**Features:**
- Track custom habits (exercise, sleep, meditation)
- Habit streaks
- Completion calendar
- Insights: "You're 85% more consistent on weekdays"
- Habit stacking suggestions
- Science-backed tips for each habit

---

### **Phase 5: Privacy & Security** (Week 9-10)
**Priority: CRITICAL** - Legal compliance and user trust

#### 5.1 Data Encryption
**Files to Create/Modify:**
- `src/lib/encryption.ts` - NEW: Client-side encryption utilities
- `functions/src/dataEncryption.ts` - Server-side encryption
- `firestore.rules` - Update security rules

**Implementation:**
```typescript
// Client-side encryption for sensitive data
import CryptoJS from 'crypto-js';

export const encryptData = (data: any, userKey: string): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), userKey).toString();
};

export const decryptData = (encryptedData: string, userKey: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, userKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// PostgreSQL encryption at rest (Neon provides this automatically)
// Plus: use pgcrypto extension for additional encryption
```

**Encryption Targets:**
- Journal entries (most sensitive)
- Weight data (user preference)
- Progress photos metadata
- Private messages with buddies

**Libraries to Install:**
```bash
pnpm add crypto-js
pnpm add @types/crypto-js -D
```

#### 5.2 GDPR Compliance
**Files to Create/Modify:**
- `src/pages/PrivacyPolicy.tsx` - NEW: Privacy policy page
- `src/pages/TermsOfService.tsx` - NEW: Terms page
- `src/components/CookieConsent.tsx` - NEW: Cookie banner
- `src/pages/DataManagement.tsx` - NEW: User data management
- `src/lib/gdpr.ts` - GDPR utilities

**Required Features:**
1. **Consent Management**
   - Cookie consent banner
   - Marketing email opt-in
   - Data processing agreement

2. **Data Access**
   - Download all user data (JSON format)
   - View data processing history
   - Data retention policy (auto-delete after 2 years of inactivity)

3. **Right to Erasure**
   - Delete account option
   - Remove all data within 30 days
   - Confirmation email
   - Backup deletion verification

4. **Transparency**
   - Privacy policy (updated: 2025)
   - Data usage explanation
   - Third-party service list (Firebase, Cloudinary)
   - Data transfer information

**GDPR API Routes (Vercel Functions):**
```typescript
// api/gdpr/export.ts
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { put } from '@vercel/blob';

export default async function handler(req: Request) {
  const { userId } = await req.json();
  
  // Verify Firebase Auth token
  const token = req.headers.get('Authorization');
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  if (decodedToken.uid !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const sql = neon(process.env.NEON_DATABASE_URL);
  
  // Collect all user data
  const userData = {
    profile: await sql`SELECT * FROM user_profiles WHERE user_id = ${userId}`,
    meals: await sql`SELECT * FROM meals WHERE user_id = ${userId}`,
    journals: await sql`SELECT * FROM journal_entries WHERE user_id = ${userId}`,
    waterLogs: await sql`SELECT * FROM water_logs WHERE user_id = ${userId}`,
    streaks: await sql`SELECT * FROM streaks WHERE user_id = ${userId}`,
    achievements: await sql`SELECT * FROM user_achievements WHERE user_id = ${userId}`,
  };
  
  // Upload to Vercel Blob
  const blob = await put(`exports/${userId}-${Date.now()}.json`, 
    JSON.stringify(userData, null, 2), 
    { access: 'public', addRandomSuffix: false }
  );
  
  // Send email with download link
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'FitTrack <noreply@fittrack.app>',
    to: decodedToken.email,
    subject: 'Your Data Export is Ready',
    html: `<p>Download your data: <a href="${blob.url}">${blob.url}</a></p>`
  });
  
  return Response.json({ success: true, url: blob.url });
}

// api/gdpr/delete.ts
export default async function handler(req: Request) {
  const { userId } = await req.json();
  
  // Verify token...
  
  const sql = neon(process.env.NEON_DATABASE_URL);
  
  // Delete all user data (cascading deletes)
  await sql`DELETE FROM users WHERE id = ${userId}`;
  
  // Delete from Cloudinary
  // Delete from Firebase Auth
  
  // Send confirmation
  await resend.emails.send({
    from: 'FitTrack <noreply@fittrack.app>',
    to: decodedToken.email,
    subject: 'Account Deletion Confirmed',
    html: '<p>Your account and all data have been permanently deleted.</p>'
  });
  
  return Response.json({ success: true });
}
```

#### 5.3 Privacy Settings
**Files to Create/Modify:**
- `src/pages/PrivacySettings.tsx` - NEW: Granular privacy controls
- `src/components/PrivacyToggle.tsx` - Toggle components

**Settings:**
```typescript
interface PrivacySettings {
  profile: {
    visibility: 'public' | 'buddies' | 'private';
    showWeight: boolean;
    showGoals: boolean;
    showProgress: boolean;
  };
  progressPhotos: {
    visibility: 'public' | 'buddies' | 'private';
  };
  communityPosts: {
    allowComments: boolean;
    allowLikes: boolean;
  };
  buddySystem: {
    shareWeightData: boolean;
    shareMealData: boolean;
    shareJournalData: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    buddyReminders: boolean;
  };
}
```

#### 5.4 Secure Data Backup
**Files to Create/Modify:**
- `functions/src/backup.ts` - Automated backup Cloud Function
- `src/components/BackupDialog.tsx` - Manual backup UI

**Features:**
- Daily automated Firestore backup to Cloud Storage
- Weekly encrypted backup email option
- Manual backup on demand
- Restore from backup (admin only)

**Vercel Cron Job:**
```typescript
// api/cron/backup.ts
// Add to vercel.json: { "crons": [{ "path": "/api/cron/backup", "schedule": "0 2 * * *" }] }

import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

export default async function handler(req: Request) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Neon provides automatic backups + point-in-time recovery
  // But we can create manual snapshots for additional safety
  
  const sql = neon(process.env.NEON_DATABASE_URL);
  
  // Export critical tables
  const backup = {
    timestamp: new Date().toISOString(),
    users: await sql`SELECT * FROM users`,
    profiles: await sql`SELECT * FROM user_profiles`,
    // ... other tables
  };
  
  // Upload to Vercel Blob (encrypted)
  const encrypted = encryptBackup(JSON.stringify(backup));
  await put(`backups/daily-${Date.now()}.json.enc`, encrypted, {
    access: 'private'
  });
  
  return Response.json({ success: true });
}
```

---

## 📊 Database Schema Updates

### PostgreSQL Schema (Drizzle ORM)

```typescript
// schema/users.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

// schema/userProfiles.ts
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  startingWeight: numeric('starting_weight'),
  goalWeight: numeric('goal_weight'),
  currentWeight: numeric('current_weight'),
  height: numeric('height'),
  setupCompleted: boolean('setup_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// schema/streaks.ts
export const streaks = pgTable('streaks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type', { enum: ['meal', 'water', 'journal', 'overall'] }).notNull(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastCheckIn: timestamp('last_check_in'),
  freezeAvailable: boolean('freeze_available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// schema/buddyPairs.ts
export const buddyPairs = pgTable('buddy_pairs', {
  id: serial('id').primaryKey(),
  user1Id: text('user1_id').references(() => users.id).notNull(),
  user2Id: text('user2_id').references(() => users.id).notNull(),
  status: text('status', { enum: ['pending', 'active', 'inactive'] }).default('pending'),
  sharedGoals: jsonb('shared_goals').$type<string[]>(),
  privacySettings: jsonb('privacy_settings').$type<PrivacySettings>(),
  createdAt: timestamp('created_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
});

// schema/progressPhotos.ts
export const progressPhotos = pgTable('progress_photos', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  url: text('url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  date: timestamp('date').notNull(),
  visibility: text('visibility', { enum: ['private', 'buddy', 'community'] }).default('private'),
  notes: text('notes'),
  weight: numeric('weight'),
  bodyFat: numeric('body_fat'),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/achievements.ts
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category', { enum: ['streak', 'weight', 'consistency', 'community', 'special'] }).notNull(),
  icon: text('icon').notNull(),
  requirement: integer('requirement').notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  achievementId: integer('achievement_id').references(() => achievements.id).notNull(),
  progress: integer('progress').default(0),
  unlockedAt: timestamp('unlocked_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/weeklyReports.ts
export const weeklyReports = pgTable('weekly_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  weekStart: timestamp('week_start').notNull(),
  weekEnd: timestamp('week_end').notNull(),
  metrics: jsonb('metrics').$type<WeeklyMetrics>(),
  insights: jsonb('insights').$type<string[]>(),
  comparisonToPrevious: jsonb('comparison_to_previous').$type<ComparisonData>(),
  emailSent: boolean('email_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/habits.ts
export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  frequency: text('frequency', { enum: ['daily', 'weekly'] }).notNull(),
  currentStreak: integer('current_streak').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const habitCompletions = pgTable('habit_completions', {
  id: serial('id').primaryKey(),
  habitId: integer('habit_id').references(() => habits.id).notNull(),
  completedAt: timestamp('completed_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/successStories.ts
export const successStories = pgTable('success_stories', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  story: text('story').notNull(),
  beforePhoto: text('before_photo').notNull(),
  afterPhoto: text('after_photo').notNull(),
  weightLost: numeric('weight_lost'),
  timeframe: text('timeframe'),
  keyTips: jsonb('key_tips').$type<string[]>(),
  likes: integer('likes').default(0),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// schema/privacySettings.ts
export const privacySettings = pgTable('privacy_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull().unique(),
  profileVisibility: text('profile_visibility', { enum: ['public', 'buddies', 'private'] }).default('public'),
  showWeight: boolean('show_weight').default(false),
  showGoals: boolean('show_goals').default(true),
  photosVisibility: text('photos_visibility', { enum: ['public', 'buddies', 'private'] }).default('private'),
  allowComments: boolean('allow_comments').default(true),
  shareWeightWithBuddy: boolean('share_weight_with_buddy').default(true),
  shareMealsWithBuddy: boolean('share_meals_with_buddy').default(true),
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Existing tables to migrate from Firestore
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  calories: numeric('calories').notNull(),
  imageUrl: text('image_url'),
  mealType: text('meal_type', { enum: ['breakfast', 'lunch', 'dinner', 'snack'] }).notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  mood: text('mood'),
  encrypted: boolean('encrypted').default(false),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const waterLogs = pgTable('water_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  glasses: integer('glasses').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Query by userId (most common)
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_meals_user_id_date ON meals(user_id, date DESC);
CREATE INDEX idx_journal_entries_user_id_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_water_logs_user_id_date ON water_logs(user_id, date DESC);
CREATE INDEX idx_progress_photos_user_id_date ON progress_photos(user_id, date DESC);
CREATE INDEX idx_habits_user_id ON habits(user_id);

-- Buddy system
CREATE INDEX idx_buddy_pairs_user1 ON buddy_pairs(user1_id);
CREATE INDEX idx_buddy_pairs_user2 ON buddy_pairs(user2_id);
CREATE INDEX idx_buddy_pairs_status ON buddy_pairs(status);

-- Reports
CREATE INDEX idx_weekly_reports_user_id_week ON weekly_reports(user_id, week_start DESC);

-- Community features
CREATE INDEX idx_success_stories_featured ON success_stories(featured, created_at DESC);
CREATE INDEX idx_success_stories_user_id ON success_stories(user_id);
```

---

## 🔧 Technical Requirements

### New Tech Stack Architecture

**Frontend:** React + Vite (Vercel)  
**Backend:** NestJS (DigitalOcean App Platform)  
**Database:** Neon PostgreSQL (Serverless Postgres)  
**Authentication:** Firebase Auth (frontend) + JWT validation (backend)  
**Storage:** Cloudinary (images)  
**Email:** Resend  
**Cost:** $5/month (up to 1K users)

> See `NESTJS_BACKEND_SETUP.md` for complete backend setup guide

### New Dependencies

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "react-joyride": "^2.7.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "crypto-js": "^4.2.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/share": "^6.0.0",
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.29.0",
    "@vercel/blob": "^0.19.0",
    "resend": "^3.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/recharts": "^1.8.29",
    "@types/crypto-js": "^4.2.1",
    "drizzle-kit": "^0.20.0"
  }
}
```

### Vercel Services

1. **Serverless Functions** (Free tier: 100GB-hours)
   - Daily check-in reminders (cron jobs)
   - Weekly report generation
   - API routes for all CRUD operations
   - GDPR data export/deletion endpoints

2. **Vercel Blob Storage** (Free tier: 500GB bandwidth)
   - PDF reports (temporary, 24hr TTL)
   - Data export files
   - Backup files

3. **Vercel Cron Jobs** (Free, built-in)
   - Schedule: `0 20 * * *` (daily reminders)
   - Schedule: `0 6 * * 1` (weekly reports)
   - No additional cost, runs serverless functions

### Neon PostgreSQL

- **Free Tier:** 512MB storage, 0.5GB data transfer
- **Serverless:** Auto-scale, pay per compute
- **Features:** Branching (dev/staging/prod), Point-in-time recovery
- **Cost:** Free tier sufficient for 1000+ users initially

---

## 📱 Mobile Considerations

### Capacitor Plugins Needed

```bash
npm install @capacitor/local-notifications
npm install @capacitor/share
npm install @capacitor/camera
npm install @capacitor/filesystem
```

### Features to Optimize:
- Offline mode for streak tracking
- Local notifications for reminders
- Share reports/photos to social media
- Photo capture directly from camera
- Biometric authentication option

---

## 🎨 Design System Updates

### New Components Needed

1. **Charts Package**
   - `LineChart.tsx` - Weight trends
   - `BarChart.tsx` - Calorie tracking
   - `AreaChart.tsx` - Water intake
   - `HeatMap.tsx` - Streak calendar
   - `PieChart.tsx` - Macronutrient breakdown

2. **Social Components**
   - `BuddyCard.tsx` - Partner profile card
   - `StoryCard.tsx` - Success story display
   - `PhotoComparison.tsx` - Before/after slider
   - `CommentThread.tsx` - Community discussions

3. **Feedback Components**
   - `AchievementToast.tsx` - Celebration animations
   - `StreakFlame.tsx` - Animated streak counter
   - `ProgressRing.tsx` - Circular progress indicators
   - `ConfettiEffect.tsx` - Achievement celebrations

---

## 🚀 Deployment Checklist

### Before Launch

- [ ] Enable Firebase Cloud Functions (upgrade to Blaze plan)
- [ ] Set up email service (SendGrid/Mailgun API keys)
- [ ] Configure Capacitor Local Notifications
- [ ] Create privacy policy and terms of service documents
- [ ] Set up GDPR-compliant cookie consent
- [ ] Test all notification triggers
- [ ] Verify data encryption working
- [ ] Run security audit on Firestore rules
- [ ] Test buddy system with real users
- [ ] Verify PDF export on mobile and web
- [ ] Load test with 100+ concurrent users
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (Firebase Analytics)
- [ ] Create backup/restore procedures
- [ ] Document API for future integrations

### Post-Launch Monitoring

- [ ] Monitor Cloud Function execution times
- [ ] Track notification delivery rates
- [ ] Analyze user engagement metrics
- [ ] Review Firestore read/write costs
- [ ] Monitor Cloudinary bandwidth usage
- [ ] Collect user feedback on new features
- [ ] A/B test achievement notification styles
- [ ] Analyze streak retention rates

---

## 📈 Success Metrics

### Key Performance Indicators (KPIs)

1. **Engagement**
   - Daily Active Users (DAU)
   - Average session duration
   - Streak retention rate (% users maintaining 7+ day streak)

2. **Accountability**
   - Check-in completion rate (target: 80%)
   - Buddy pair activity rate
   - Weekly report open rate (target: 60%)

3. **Growth**
   - User retention (30-day: 40%, 90-day: 25%)
   - Buddy pair formation rate
   - Community post engagement (likes, comments)

4. **Monetization (Future)**
   - Premium feature adoption
   - Buddy system usage
   - Report export frequency

---

## 💰 Cost Estimates (Vercel + Neon Stack)

### Vercel (Hobby Plan - Free)

**Free Tier Includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless Functions: 100GB-hours
- Edge Functions: 500K invocations
- Vercel Blob: 500GB bandwidth
- Cron Jobs: Unlimited

**Pro Plan ($20/month) - Needed when scaling:**
- 1TB bandwidth
- 1000GB-hours functions
- Custom domains
- Team collaboration

### Neon PostgreSQL (Free Tier)

**Free Forever:**
- 512MB storage (enough for ~50K users)
- 0.5GB data transfer/month
- Unlimited queries
- Branching (dev/staging)
- Point-in-time recovery (7 days)

**Scale Plan ($19/month) - When needed:**
- 10GB storage
- Unlimited data transfer
- Autoscaling compute
- 30-day recovery

### Firebase Authentication (Free)

**Free Tier:**
- 50K MAU (Monthly Active Users)
- Email/Password + Google OAuth
- Custom token generation
- **Cost: $0 until 50K users**

### Cloudinary (Free Tier)

- 25GB storage
- 25GB bandwidth/month
- Image transformations
- **Cost: $0 for ~10K photos**

### Resend Email (Free Tier)

**Free Forever:**
- 100 emails/day (3000/month)
- Custom domain
- Webhooks
- **Paid: $20/month for 50K emails**

### Total Cost Comparison

| Users | Vercel | Neon | Firebase Auth | Cloudinary | Resend | **Total** |
|-------|--------|------|---------------|------------|--------|-----------|
| 0-500 | Free | Free | Free | Free | Free | **$0/month** |
| 500-2K | Free | Free | Free | Free | $20 | **$20/month** |
| 2K-10K | $20 | $19 | Free | Free | $20 | **$59/month** |
| 10K+ | $20 | $39 | Free | $89 | $20 | **$168/month** |

**🎉 Vercel + Neon is FREE for first 500 users!**  
**🔥 Firebase + Cloud Functions would cost $30-50/month from day 1**

---

## 🎯 Priority Matrix

| Feature | User Impact | Dev Effort | Priority | Timeline |
|---------|-------------|------------|----------|----------|
| Daily Streaks | 🔥 High | 3 days | P0 | Week 1 |
| Missed Notifications | 🔥 High | 4 days | P0 | Week 1-2 |
| Weekly Reports | 🔥 High | 5 days | P0 | Week 2 |
| Progress Charts | 🔥 High | 5 days | P0 | Week 5 |
| Buddy System | 🌟 Medium | 7 days | P1 | Week 3-4 |
| Progress Photos | 🌟 Medium | 4 days | P1 | Week 4 |
| Achievement System | 🌟 Medium | 3 days | P1 | Week 5 |
| Onboarding Tour | ⭐ Low | 2 days | P2 | Week 5 |
| Data Export (PDF) | ⭐ Low | 3 days | P2 | Week 6 |
| Motivational Content | ⭐ Low | 2 days | P2 | Week 7 |
| Educational Library | ⭐ Low | 4 days | P2 | Week 7-8 |
| Success Stories | ⭐ Low | 3 days | P2 | Week 8 |
| Habit Tracking | ⭐ Low | 4 days | P2 | Week 8 |
| Data Encryption | 🔒 Critical | 3 days | P0 | Week 9 |
| GDPR Compliance | 🔒 Critical | 4 days | P0 | Week 9-10 |
| Privacy Settings | 🔒 Critical | 3 days | P0 | Week 10 |

**Priority Legend:**
- P0: Must have for launch
- P1: Should have for competitive advantage
- P2: Nice to have for engagement

---

## 📝 Next Steps

### Immediate Actions (This Week)

1. **Review & Approve Plan**
   - Confirm Vercel + Neon architecture
   - No budget needed (starts FREE)
   - Timeline confirmation

2. **Setup Development Environment**
   ```bash
   # Install new dependencies
   pnpm add recharts date-fns react-joyride jspdf jspdf-autotable crypto-js
   pnpm add @capacitor/local-notifications @capacitor/share
   pnpm add @neondatabase/serverless drizzle-orm @vercel/blob resend zod
   
   # Install dev dependencies
   pnpm add -D @types/recharts @types/crypto-js drizzle-kit
   ```

3. **Setup Neon Database**
   - Sign up at https://neon.tech (free, no credit card)
   - Create project "fittrack-prod"
   - Copy connection string
   - Run migrations: `pnpm drizzle-kit push:pg`

4. **Setup Vercel**
   - Push to GitHub (already done ✅)
   - Import project at vercel.com
   - Add environment variables:
     - `NEON_DATABASE_URL`
     - `FIREBASE_*` (existing auth config)
     - `CLOUDINARY_*` (existing)
     - `RESEND_API_KEY` (get from resend.com)
   - Deploy! (automatic on push)

5. **Migrate from Firestore to Neon**
   - Create migration script `scripts/firestore-to-neon.ts`
   - Export existing Firestore data
   - Import into Neon PostgreSQL
   - Update all API calls to use Neon

6. **Start Phase 1**
   - Create `api/streaks/get.ts` (Vercel function)
   - Create `src/lib/streaks.ts` (client utilities)
   - Design streak tracking UI
   - Implement daily check-in page
   - Set up first cron job (check-in reminders)

### Weekly Goals

**Week 1:** Daily streaks + missed check-in notifications working  
**Week 2:** Weekly reports generating and sending via email  
**Week 3:** Buddy system with request/accept flow  
**Week 4:** Progress photos with before/after comparison  
**Week 5:** Charts, analytics dashboard, onboarding tour  
**Week 6:** Achievement system, PDF export  
**Week 7:** Motivational content, educational library  
**Week 8:** Success stories, habit tracking  
**Week 9:** Data encryption, GDPR compliance basics  
**Week 10:** Privacy settings, secure backup, final testing  

---

## 🤝 Team Collaboration

### Roles Needed (if expanding team)

- **Backend Developer**: Cloud Functions, complex Firestore queries
- **UI/UX Designer**: Chart design, achievement animations
- **Content Writer**: Motivational quotes, nutrition tips, educational articles
- **Legal Consultant**: GDPR compliance review, privacy policy drafting
- **QA Tester**: Feature testing, security audit, performance testing

### Solo Developer Path

- Focus on P0 features first (streaks, notifications, reports)
- Use pre-built content libraries for quotes/tips
- Leverage Firebase extensions for email
- Use templates for privacy policy/terms
- Implement basic GDPR features (data export/delete)

---

## 📚 Resources & References

### Libraries & Tools
- [Recharts Documentation](https://recharts.org/)
- [React Joyride (Onboarding)](https://docs.react-joyride.com/)
- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)

### Legal & Compliance
- [GDPR Checklist](https://gdpr.eu/checklist/)
- [Firebase GDPR Compliance](https://firebase.google.com/support/privacy)
- [Privacy Policy Generator](https://www.privacypolicies.com/)

### Design Inspiration
- [Duolingo Streaks](https://blog.duolingo.com/streaks/)
- [MyFitnessPal Progress](https://www.myfitnesspal.com/)
- [Strava Social Features](https://www.strava.com/)

---

## 🎉 Conclusion

This roadmap transforms FitTrack from a basic tracking app into a comprehensive wellness platform with professional accountability features. The phased approach ensures critical features (streaks, notifications, privacy) are implemented first, while engagement features (buddies, content, achievements) enhance retention over time.

**Estimated Total Development Time: 10 weeks (solo developer, full-time)**  
**Estimated Monthly Operating Cost: $20-75 (500-1000 users)**  
**Expected User Retention Improvement: 2-3x with full feature set**

---

**Last Updated:** November 24, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation
