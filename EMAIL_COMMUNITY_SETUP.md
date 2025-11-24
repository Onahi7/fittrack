# Email & Community Features Setup Guide

This guide covers setting up Resend for email notifications and the community features in Intentional.

---

## 📧 Part 1: Resend Email Setup

### Step 1: Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### Step 2: Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click "Create API Key"
3. Name it: `Intentional Production`
4. Copy the API key (starts with `re_`)
5. Add to your `.env` file:
   ```env
   VITE_RESEND_API_KEY=re_your_api_key_here
   VITE_APP_URL=http://localhost:5173
   ```

### Step 3: Verify Domain (Optional for Production)

For production, verify your domain to send from your own email:

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `intentional.app`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually 5-10 minutes)
6. Update email sender in `src/lib/email.ts`:
   ```typescript
   from: 'Intentional <noreply@yourdomain.com>'
   ```

### Email Templates Included

1. **Daily Check-In Reminder** - Reminds users to log meals, water, and journal
2. **Weekly Check-In Reminder** - Weekly weigh-in and progress review
3. **Meal Logging Reminder** - Breakfast, lunch, dinner reminders
4. **Achievement Unlocked** - Celebrates user milestones
5. **Challenge Invitation** - Invites users to join challenges

### Scheduling Email Reminders

To schedule automated emails, you'll need to set up Firebase Cloud Functions:

1. Initialize Cloud Functions:
   ```bash
   firebase init functions
   ```

2. Create a scheduled function in `functions/src/index.ts`:
   ```typescript
   import * as functions from 'firebase-functions';
   import { sendDailyCheckInReminder } from './email';
   
   // Send daily reminders at 9 AM
   export const sendDailyReminders = functions.pubsub
     .schedule('0 9 * * *')
     .timeZone('America/New_York')
     .onRun(async (context) => {
       // Fetch users with reminders enabled
       // Send emails
     });
   ```

3. Deploy:
   ```bash
   firebase deploy --only functions
   ```

---

## 👥 Part 2: Community Features

### Database Schema

The community features use these Firestore collections:

#### Groups Collection
```typescript
{
  id: string;
  name: string;
  description: string;
  category: string; // 'Weight Loss', 'Nutrition', 'Fitness', etc.
  imageUrl?: string;
  creatorId: string;
  memberIds: string[];
  memberCount: number;
  isPrivate: boolean;
  createdAt: Timestamp;
}
```

#### Posts Collection
```typescript
{
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  groupId?: string;
  type: 'meal' | 'progress' | 'milestone' | 'general';
  likes: number;
  commentCount: number;
  createdAt: Timestamp;
}
```

#### Challenges Collection
```typescript
{
  id: string;
  name: string;
  description: string;
  type: 'water' | 'meals' | 'streak' | 'custom';
  goal: number;
  duration: number; // days
  startDate: Timestamp;
  endDate: Timestamp;
  participantCount: number;
  creatorId: string;
  imageUrl?: string;
  createdAt: Timestamp;
}
```

#### Challenge Participants
```typescript
{
  challengeId: string;
  userId: string;
  progress: number;
  joinedAt: Timestamp;
}
```

#### Friendships Collection
```typescript
{
  user1Id: string;
  user2Id: string;
  createdAt: Timestamp;
}
```

### Firestore Security Rules

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... existing rules ...
    
    // Groups
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.creatorId || 
         request.auth.uid in resource.data.memberIds);
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.creatorId;
    }
    
    // Posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Challenges
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.creatorId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.creatorId;
    }
    
    // Challenge Participants
    match /challengeParticipants/{participantId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Friendships
    match /friendships/{friendshipId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.user1Id || 
         request.auth.uid == resource.data.user2Id);
    }
    
    // Friend Requests
    match /friendRequests/{requestId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.fromUserId || 
         request.auth.uid == resource.data.toUserId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.toUserId;
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.fromUserId || 
         request.auth.uid == resource.data.toUserId);
    }
    
    // Reactions
    match /reactions/{reactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Community Pages Created

1. **Community Hub** (`/community`)
   - Quick stats dashboard
   - Active challenges overview
   - Recent community activity
   - Quick access to all features

2. **Social Feed** (`/community/feed`)
   - Create posts with photos
   - Like and comment on posts
   - Share meal photos and progress
   - Filter by post type

3. **Challenges** (`/community/challenges`)
   - Browse active and upcoming challenges
   - Join challenges
   - Track progress
   - View leaderboards
   - Create custom challenges

4. **Groups** (`/community/groups`)
   - Discover groups by category
   - Join public/private groups
   - View group feed
   - Create new groups

### Features to Implement Next

- [ ] Comments on posts
- [ ] Friend search and management
- [ ] Direct messaging between friends
- [ ] Challenge leaderboards with real data
- [ ] Group chat/discussions
- [ ] Notifications for community activity
- [ ] User profiles with stats
- [ ] Following system
- [ ] Hashtag support in posts
- [ ] Photo galleries per group

### Testing Community Features

1. Create a test group
2. Post in the feed
3. Join a challenge
4. Invite a friend
5. Test privacy settings

---

## 🚀 Deployment

### Vercel Environment Variables

Add these to your Vercel project:

```
VITE_RESEND_API_KEY=re_your_api_key
VITE_APP_URL=https://your-app.vercel.app
```

### Firebase Indexes

Some community queries require composite indexes. Firebase will prompt you to create them when first used. Click the provided links to auto-create indexes.

Common indexes needed:
- `posts`: `createdAt DESC`, `groupId ASC`
- `challenges`: `endDate ASC`, `participantCount DESC`
- `groups`: `category ASC`, `memberCount DESC`

---

## 📊 Analytics & Monitoring

### Track Community Engagement

Add Firebase Analytics events:

```typescript
import { logEvent } from 'firebase/analytics';

// Track community actions
logEvent(analytics, 'join_group', { groupId });
logEvent(analytics, 'join_challenge', { challengeId });
logEvent(analytics, 'create_post', { type: 'meal' });
```

### Monitor Email Delivery

Check Resend dashboard for:
- Delivery rates
- Open rates (if enabled)
- Bounce rates
- Failed sends

---

## 🔒 Security Best Practices

1. **Validate all user input** before creating posts/groups
2. **Rate limit** post creation (max 10 posts/hour)
3. **Moderate content** - add reporting functionality
4. **Private groups** - enforce access control
5. **Email verification** - ensure users own their email
6. **Block/mute features** - user safety controls

---

## 💡 Tips

- **Start small**: Enable features gradually for your users
- **Community guidelines**: Create clear rules for posts
- **Moderation**: Assign community moderators
- **Engagement**: Seed initial content and challenges
- **Feedback**: Ask users what features they want

---

## Support

- [Resend Documentation](https://resend.com/docs)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
