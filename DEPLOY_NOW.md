# 🎯 Step-by-Step: Deploy Your App to Mobile

## Run these commands in order:

### Step 1: Install Capacitor (2 minutes)
```bash
cd C:\Users\HP\Downloads\intentional

# Install core Capacitor packages
pnpm add @capacitor/core @capacitor/cli

# Install platform-specific packages
pnpm add @capacitor/android @capacitor/ios

# Install notification plugins
pnpm add @capacitor/local-notifications @capacitor/push-notifications
```

---

### Step 2: Initialize Capacitor (1 minute)
```bash
npx cap init
```

**When prompted, enter:**
- **App name:** `Intentional`
- **App ID:** `com.intentional.app` (or use your domain like `com.yourdomain.intentional`)
- **Web asset directory:** `dist`

This creates `capacitor.config.ts` in your project root.

---

### Step 3: Update Vite Config (1 minute)

Open `vite.config.ts` and ensure it has:

```typescript
export default defineConfig({
  base: './', // Important for mobile!
  // ... rest of your config
})
```

---

### Step 4: Build Your React App (2 minutes)
```bash
pnpm build
```

This creates the `dist/` folder with your optimized app.

---

### Step 5: Add Android Platform (3 minutes)
```bash
npx cap add android
```

This creates an `android/` folder with a complete Android Studio project.

---

### Step 6: Sync Web Assets to Native App (1 minute)
```bash
npx cap sync
```

This copies your `dist/` folder into the Android app.

---

### Step 7: Open in Android Studio (2 minutes)
```bash
npx cap open android
```

**First time setup:**
1. Wait for Android Studio to open
2. Wait for Gradle sync to complete (5-10 minutes first time)
3. If prompted, install any missing SDK components

---

### Step 8: Run on Android Device/Emulator (5 minutes)

**Option A: Use Physical Device (Recommended)**
1. Enable Developer Options on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging (ON)
3. Connect phone via USB cable
4. In Android Studio, select your device from the dropdown
5. Click the green Play button ▶️

**Option B: Use Emulator**
1. Tools → Device Manager → Create Device
2. Select any phone (e.g., Pixel 5)
3. Download system image (e.g., Android 13)
4. Click Finish
5. Select the emulator from the dropdown
6. Click the green Play button ▶️

---

### Step 9 (Optional): Add iOS Platform (Mac Only)

```bash
# Only run this if you have a Mac
npx cap add ios

npx cap sync

npx cap open ios
```

In Xcode:
1. Select your Apple Developer team (sign in with Apple ID)
2. Select a device or simulator
3. Click the Play button ▶️

---

## 🎉 Success!

Your app is now running on mobile! You should see the same interface as the web version.

---

## Next: Making Updates

Every time you change your React code:

```bash
# 1. Build
pnpm build

# 2. Sync to native apps
npx cap sync

# 3. Run in Android Studio (it will auto-reload)
```

---

## Next: Add Notifications

Edit `src/App.tsx` and add this at the top:

```typescript
import { useEffect } from 'react';
import { initializeLocalNotifications, scheduleMealReminders } from '@/lib/notifications';

function App() {
  useEffect(() => {
    // Initialize notifications when app starts
    initializeLocalNotifications().then(async (enabled) => {
      if (enabled) {
        // Schedule default meal reminders
        await scheduleMealReminders(['08:00', '12:00', '18:00']);
        console.log('Notifications scheduled!');
      }
    });
  }, []);

  // ... rest of your App component
}
```

Build, sync, and test on your phone to see notifications!

---

## Troubleshooting

### "Gradle sync failed"
- Make sure Android Studio SDK is fully installed
- Wait patiently - first sync takes 10+ minutes

### "Device not found"
- Make sure USB debugging is enabled
- Try a different USB cable
- Run `adb devices` in terminal to check connection

### "Module not found" errors
- Make sure you ran `pnpm build` before `npx cap sync`
- Check that `vite.config.ts` has `base: './'`

### App crashes on launch
- Check Android Studio Logcat for errors
- Common issue: Missing permissions in AndroidManifest.xml

---

## 📱 Deploy to Google Play Store

Once you're happy with your app:

1. **Create Google Play Developer Account**
   - Go to https://play.google.com/console/signup
   - Pay $25 one-time fee

2. **Generate Signing Key in Android Studio**
   - Build → Generate Signed Bundle/APK
   - Create new keystore (SAVE THE PASSWORD!)
   - Select "Android App Bundle" (AAB)

3. **Upload to Play Console**
   - Create new app in Play Console
   - Add screenshots, description, icon
   - Upload the AAB file
   - Submit for review

4. **Wait for Review**
   - Usually 1-3 days
   - Check email for updates

---

## 🍎 Deploy to Apple App Store (Mac only)

1. **Enroll in Apple Developer Program**
   - Cost: $99/year
   - https://developer.apple.com/programs/

2. **Create App in App Store Connect**
   - https://appstoreconnect.apple.com
   - Create new app
   - Fill in metadata

3. **Archive in Xcode**
   - Product → Archive
   - Distribute App → App Store Connect

4. **Submit for Review**
   - Complete all required info
   - Submit (review takes 1-3 days)

---

## 🎯 What to Do Now

1. ✅ Run Step 1-8 above to get your app running on Android
2. ✅ Test the app thoroughly on your phone
3. ✅ Add notification initialization to App.tsx
4. ✅ Test notifications on your phone
5. ✅ If everything works, create developer accounts
6. ✅ Submit to app stores!

---

## 💰 Total Cost

| Item | Cost |
|------|------|
| Development | FREE |
| Google Play Developer | $25 one-time |
| Apple Developer Program | $99/year |
| Push Notifications | FREE |
| **Total first year** | $124 |
| **Yearly after** | $99 (iOS only) |

**No ongoing costs** for hosting, notifications, or infrastructure (thanks to Firebase free tier)!
