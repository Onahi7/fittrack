# Firebase Setup Guide for Intentional

This guide will walk you through setting up Firebase for the Intentional wellness app.

## Prerequisites

- A Google account
- Node.js and pnpm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `intentional-wellness` (or your preferred name)
4. Disable Google Analytics (optional for this app)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **web icon** (`</>`) to add a web app
2. Enter app nickname: `Intentional Web App`
3. **Do NOT** check "Firebase Hosting" (we'll use Vercel)
4. Click "Register app"
5. Copy the `firebaseConfig` object - you'll need these values

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   **Important:** Never commit `.env` to version control!

## Step 4: Enable Firebase Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. Enable **Google** sign-in method:
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email
   - Click "Save"

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose a location close to your users (e.g., `us-central1`)
5. Click "Enable"

### Configure Firestore Rules

After creating the database, update the Firestore rules:

1. Go to **Firestore Database > Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Meals collection
    match /meals/{mealId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Journal entries collection
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Water intake collection
    match /waterIntake/{intakeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Weekly check-ins collection
    match /weeklyCheckins/{checkinId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Achievements collection
    match /achievements/{achievementId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## Step 6: Set Up Firebase Storage

1. In Firebase Console, go to **Build > Storage**
2. Click "Get started"
3. Select **Start in production mode**
4. Use the same location as your Firestore database
5. Click "Done"

### Configure Storage Rules

1. Go to **Storage > Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Meal images
    match /meals/{userId}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profile pictures
    match /profiles/{userId}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Run the App Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser to `http://localhost:5173`

4. Test the authentication:
   - Try signing up with email/password
   - Try signing in with Google

## Step 8: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. In **Environment Variables** section, add all your Firebase credentials:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   pnpm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   # ... add all other variables
   ```

5. Redeploy:
   ```bash
   vercel --prod
   ```

## Step 9: Update Firebase Authorized Domains

After deploying to Vercel, you need to authorize your domain:

1. In Firebase Console, go to **Authentication > Settings > Authorized domains**
2. Click "Add domain"
3. Add your Vercel domain (e.g., `your-app.vercel.app`)
4. Click "Add"

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure your deployment domain is added to Firebase Authorized domains

### "Firebase: Error (auth/invalid-api-key)"
- Double-check your `.env` file has the correct API key
- Make sure environment variables are prefixed with `VITE_`

### "Permission denied" errors in Firestore
- Check that your Firestore security rules are properly configured
- Make sure you're authenticated before accessing data

### Images not uploading to Storage
- Verify Storage rules allow authenticated users to upload
- Check file size limits (Firebase free tier: 5GB total)

## Security Best Practices

1. **Never commit `.env` file** - it's already in `.gitignore`
2. **Use Firestore security rules** - never allow public read/write
3. **Validate data** - add validation in security rules
4. **Monitor usage** - check Firebase Console regularly for unusual activity
5. **Enable App Check** (optional) - for additional security against abuse

## Next Steps

- [ ] Set up Firebase Cloud Functions for AI calorie estimation
- [ ] Configure Firebase Analytics
- [ ] Set up automated backups for Firestore
- [ ] Implement email verification for new users
- [ ] Add password reset functionality

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
