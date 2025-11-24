# Database Setup Guide

## Quick Setup Checklist

Follow these steps to set up your Firebase database:

### Required (Free Spark Plan)
- [ ] Enable Email/Password Authentication
- [ ] Create Firestore Database
- [ ] Configure Firestore Security Rules

### Optional
- [ ] Enable Google Authentication
- [ ] Set up Storage for Images (Requires Blaze/paid plan upgrade)
- [ ] Configure Storage Security Rules (If using Storage)
- [ ] Create indexes for queries (As needed)

---

## 1. Enable Firebase Authentication

### Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **napps-3db69**
3. Navigate to **Build → Authentication**
4. Click **"Get Started"** (if first time)
5. Go to **"Sign-in method"** tab
6. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle **Enable** to ON
   - Click **Save**

### Google Authentication (Optional)
1. In the same "Sign-in method" tab
2. Click on **"Google"**
3. Toggle **Enable** to ON
4. Add your support email
5. Click **Save**

### Authorized Domains
Make sure these domains are authorized:
- `localhost` (for development)
- Your Vercel domain (e.g., `your-app.vercel.app`)
- Any custom domains

Go to **Authentication → Settings → Authorized domains** to verify.

---

## 2. Create Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules next)
4. Choose a location close to your users:
   - **us-central1** (Iowa) - Good for North America
   - **europe-west1** (Belgium) - Good for Europe
   - **asia-south1** (Mumbai) - Good for India/Asia
5. Click **"Enable"**

---

## 3. Firestore Security Rules

Copy and paste these rules to secure your database:

1. Go to **Firestore Database → Rules** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidUser(data) {
      return data.keys().hasAll(['uid', 'email', 'displayName']) &&
             data.uid is string &&
             data.email is string &&
             data.displayName is string;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) && isValidUser(request.resource.data);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Meals collection
    match /meals/{mealId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Journal entries collection
    match /journalEntries/{entryId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Water intake collection
    match /waterIntake/{intakeId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Weekly check-ins collection
    match /weeklyCheckins/{checkinId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Achievements collection
    match /achievements/{achievementId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Community posts collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
      
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
      }
      
      // Likes subcollection
      match /likes/{likeId} {
        allow read: if isAuthenticated();
        allow create, delete: if isAuthenticated() && isOwner(likeId);
      }
    }
    
    // Community groups collection
    match /groups/{groupId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (isOwner(resource.data.createdBy) || 
         request.auth.uid in resource.data.members);
      allow delete: if isAuthenticated() && isOwner(resource.data.createdBy);
      
      // Group members subcollection
      match /members/{memberId} {
        allow read: if isAuthenticated();
        allow create, delete: if isAuthenticated();
      }
    }
    
    // Community challenges collection
    match /challenges/{challengeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isOwner(resource.data.createdBy);
      allow delete: if isAuthenticated() && isOwner(resource.data.createdBy);
      
      // Challenge participants subcollection
      match /participants/{participantId} {
        allow read: if isAuthenticated();
        allow create, delete: if isAuthenticated() && isOwner(participantId);
      }
    }
  }
}
```

3. Click **"Publish"**

---

## 4. Create Firestore Indexes

Some queries require composite indexes. Create them as needed:

1. Go to **Firestore Database → Indexes** tab
2. Add the following indexes:

### Meals Index
- **Collection**: `meals`
- **Fields**: 
  - `userId` (Ascending)
  - `createdAt` (Descending)

### Journal Entries Index
- **Collection**: `journalEntries`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Descending)

### Water Intake Index
- **Collection**: `waterIntake`
- **Fields**:
  - `userId` (Ascending)
  - `date` (Descending)

### Posts Index (Community)
- **Collection**: `posts`
- **Fields**:
  - `createdAt` (Descending)
  - `userId` (Ascending)

**Note:** Firebase will suggest creating indexes when you run queries that need them. You can create them on-demand.

---

## 5. Set Up Image Uploads with Cloudinary (RECOMMENDED - FREE)

> **✅ We recommend Cloudinary** instead of Firebase Storage because:
> - **100% Free** - No credit card required (Firebase Storage requires paid Blaze plan)
> - **25GB storage + 25GB bandwidth/month** - More generous than Firebase free tier
> - **Automatic image optimization** - Built-in transformations and CDN
> - **5 minute setup** - See `QUICK_IMAGE_SETUP.md` or `CLOUDINARY_SETUP.md`
>
> **Already set up Cloudinary?** Skip to [Section 6](#6-initialize-user-profile-on-signup)
> 
> **Quick Setup**: 
> 1. Sign up at https://cloudinary.com/users/register/free
> 2. Get your Cloud Name from dashboard
> 3. Create upload preset named "intentional-meals" (set to Unsigned)
> 4. Add `VITE_CLOUDINARY_CLOUD_NAME` to your .env file
> 5. Done! See `QUICK_IMAGE_SETUP.md` for detailed steps

---

### Alternative: Firebase Storage (Requires Blaze Plan - NOT RECOMMENDED)

> **⚠️ Skip this if using Cloudinary** (recommended above)

### Create Storage Bucket (Requires Blaze Plan)
1. In Firebase Console, go to **Build → Storage**
2. Click **"Get started"**
3. **⚠️ You'll see a prompt to upgrade to Blaze plan**
4. If you want to proceed:
   - Click "Upgrade project"
   - Add billing information
   - Set a budget alert (recommended: $5-10/month)
5. Select **"Start in production mode"**
6. Use the same location as your Firestore database
7. Click **"Done"**

### Blaze Plan Details
- **Free tier included**: 5GB storage, 1GB/day downloads
- **Cost after free tier**: $0.026/GB storage, $0.12/GB downloads
- **Typical usage**: For a personal app, you'll likely stay within free tier
- **Budget alerts**: Set up billing alerts to avoid surprises

### Configure Storage Security Rules

1. Go to **Storage → Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isUnder10MB() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    
    // Meal images
    match /meals/{userId}/{imageId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImage() && isUnder10MB();
      allow delete: if isOwner(userId);
    }
    
    // Profile pictures
    match /profiles/{userId}/{imageId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImage() && isUnder10MB();
      allow delete: if isOwner(userId);
    }
    
    // Community post images
    match /posts/{userId}/{imageId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImage() && isUnder10MB();
      allow delete: if isOwner(userId);
    }
  }
}
```

3. Click **"Publish"**

---

## 6. Initialize User Profile on Signup

The app automatically creates a user profile when someone signs up. The profile includes:

### User Profile Structure
```typescript
{
  uid: string
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  
  // Stats
  currentStreak: number
  longestStreak: number
  totalEntries: number
  totalMeals: number
  totalWaterGlasses: number
  
  // Goals
  startingWeight?: number
  currentWeight?: number
  goalWeight?: number
  dailyWaterGoal: number (default: 8)
  dailyMealGoal: number (default: 4)
  
  // Notifications
  notifications: {
    dailyReminder: boolean
    weeklyCheckIn: boolean
    mealReminder: boolean
    achievements: boolean
    communityActivity: boolean
  }
  
  theme: 'light' | 'dark' | 'system'
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 7. Database Collections Overview

Your app uses these Firestore collections:

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles and preferences | uid, displayName, email, stats |
| `meals` | Meal logging with photos | userId, type, imageUrl, calories |
| `journalEntries` | Daily journal entries | userId, mood, energy, sleep, notes |
| `waterIntake` | Water consumption tracking | userId, glasses, date |
| `weeklyCheckins` | Weekly weight check-ins | userId, weight, date |
| `achievements` | User achievements/badges | userId, type, unlockedAt |
| `posts` | Community posts | userId, content, imageUrl, likes |
| `groups` | Community groups | name, description, members |
| `challenges` | Community challenges | title, description, participants |

---

## 8. Test Your Setup

### Test Authentication
1. Run your app: `pnpm dev`
2. Go to `http://localhost:5173`
3. Try signing up with email/password
4. Check Firebase Console → Authentication → Users

### Test Firestore
1. Sign in to your app
2. Complete the setup form (weight, height, goals)
3. Check Firebase Console → Firestore Database
4. You should see a document in the `users` collection

### Test Storage (if logging meals)
1. Log a meal with a photo
2. Check Firebase Console → Storage
3. You should see the image in `meals/{userId}/` folder

---

## 9. Common Issues & Solutions

### "Missing or insufficient permissions"
- **Cause**: Security rules are blocking the request
- **Solution**: Check your Firestore rules match the ones above
- **Debug**: Use Firebase Console → Firestore → Rules Playground to test

### "Index not found" error
- **Cause**: Query requires a composite index
- **Solution**: Click the link in the error message to create the index automatically
- **Or**: Manually create the index in Firebase Console

### "CORS error" when uploading images
- **Cause**: Storage rules or CORS configuration
- **Solution**: Ensure Storage rules allow authenticated users to write

### Profile not created on signup
- **Cause**: Error in signup flow or Firestore rules
- **Solution**: Check browser console for errors
- **Debug**: Look at Network tab for failed requests

---

## 10. Monitoring & Maintenance

### Daily Checks
- Monitor usage in Firebase Console → Usage and billing
- Check for failed authentication attempts
- Review error logs

### Weekly Tasks
- Review security rules effectiveness
- Check storage usage and clean up old files
- Monitor database read/write operations

### Monthly Tasks
- Backup Firestore data (use Firebase CLI or extensions)
- Review and optimize database indexes
- Check for suspicious activity

---

## 11. Backup Strategy

### Option 1: Manual Export (Free)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export Firestore
firebase firestore:export gs://your-bucket-name/backups/$(date +%Y%m%d)
```

### Option 2: Scheduled Backups (Cloud Function)
Set up a Cloud Function to automatically backup Firestore daily.

### Option 3: Firebase Extensions
Install the "Firestore Backup" extension from Firebase Extensions marketplace.

---

## 12. Next Steps

After completing the database setup:

1. **Test all features**: Journal, meals, water tracking, weekly check-ins
2. **Set up notifications**: Follow `NOTIFICATIONS_SETUP.md`
3. **Enable community features**: Test posts, groups, challenges
4. **Deploy to production**: Follow `DEPLOY_NOW.md`
5. **Monitor usage**: Set up Firebase budget alerts

---

## Support Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## Quick Reference Commands

```bash
# Check Firebase configuration
firebase use

# Test Firestore rules locally
firebase emulators:start --only firestore

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Export Firestore data
firebase firestore:export gs://your-bucket/backup

# Import Firestore data
firebase firestore:import gs://your-bucket/backup
```

---

✅ **Setup Complete!** Your database is ready to use.
