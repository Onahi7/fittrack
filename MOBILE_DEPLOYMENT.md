# Mobile Deployment Guide

This guide explains how to deploy your Intentional app as native Android and iOS applications.

## Overview

We'll use **Capacitor** (by Ionic) to wrap your React web app into native mobile apps. Capacitor allows you to:
- Deploy to Google Play Store (Android)
- Deploy to Apple App Store (iOS)
- Access native device features (camera, notifications, etc.)
- Use the same codebase for web and mobile

---

## Prerequisites

### For Both Platforms:
- Node.js and pnpm installed ✅
- Your app built and tested in the browser ✅

### For Android:
- **Android Studio** (download from https://developer.android.com/studio)
- Java Development Kit (JDK 17+) - comes with Android Studio
- Physical Android device or emulator

### For iOS (Mac only):
- **Xcode** (from Mac App Store)
- Apple Developer Account ($99/year for App Store deployment)
- Physical iPhone/iPad or iOS Simulator
- Mac computer (required for iOS builds)

---

## Step 1: Install Capacitor

```bash
cd C:\Users\HP\Downloads\intentional

# Install Capacitor
pnpm add @capacitor/core @capacitor/cli

# Install platform-specific packages
pnpm add @capacitor/android @capacitor/ios

# Install push notifications plugin
pnpm add @capacitor/push-notifications

# Install local notifications plugin
pnpm add @capacitor/local-notifications
```

---

## Step 2: Initialize Capacitor

```bash
# Initialize Capacitor in your project
npx cap init

# When prompted:
# App name: Intentional
# App ID: com.intentional.app (or your custom domain reversed)
# Web asset directory: dist
```

This creates a `capacitor.config.ts` file in your project root.

---

## Step 3: Build Your Web App

```bash
# Build the production version of your React app
pnpm build
```

This creates an optimized production build in the `dist/` folder.

---

## Step 4: Add Mobile Platforms

### Add Android:
```bash
npx cap add android
```

This creates an `android/` folder with a native Android project.

### Add iOS (Mac only):
```bash
npx cap add ios
```

This creates an `ios/` folder with a native Xcode project.

---

## Step 5: Sync Your Web App to Native Projects

Every time you make changes to your web app, run:

```bash
pnpm build
npx cap sync
```

This copies your web assets to the native projects.

---

## Step 6: Open and Run in Native IDEs

### For Android:

```bash
npx cap open android
```

This opens Android Studio. Then:

1. Wait for Gradle sync to complete
2. Connect an Android device via USB (enable USB debugging) OR start an emulator
3. Click the green "Run" button (▶️) at the top
4. Select your device and press OK

**First-time setup in Android Studio:**
- Tools → SDK Manager → Install latest Android SDK
- Tools → Device Manager → Create a virtual device (if no physical device)

### For iOS (Mac only):

```bash
npx cap open ios
```

This opens Xcode. Then:

1. Select your development team (sign in with Apple ID)
2. Select a device or simulator from the device dropdown
3. Click the "Play" button (▶️) at the top left

---

## Step 7: Configure App Icons and Splash Screens

### Generate Icons:

1. Create a 1024x1024px PNG icon for your app
2. Use a tool like **Capacitor Assets Generator**:

```bash
pnpm add -D @capacitor/assets

# Place your icon at: resources/icon.png
# Place your splash screen at: resources/splash.png

npx capacitor-assets generate
```

This automatically generates all required icon sizes for Android and iOS.

---

## Step 8: Test on Real Devices

### Android:
1. Enable Developer Options on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect via USB
4. Run from Android Studio

### iOS:
1. Connect iPhone/iPad via USB to your Mac
2. Trust the computer on your device
3. In Xcode, select your device from the dropdown
4. Click Play (Xcode will install a development certificate)

---

## Step 9: Prepare for App Store Deployment

### Android (Google Play Store):

1. **Generate a Signing Key:**
   ```bash
   keytool -genkey -v -keystore intentional-release-key.keystore -alias intentional -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing in Android Studio:**
   - Build → Generate Signed Bundle / APK
   - Select "Android App Bundle" (AAB format required by Play Store)
   - Follow prompts to sign with your keystore

3. **Create a Google Play Developer Account:**
   - Cost: $25 one-time fee
   - https://play.google.com/console/signup

4. **Upload AAB File:**
   - Go to Play Console → Create App
   - Fill in app details (screenshots, description, etc.)
   - Upload your signed AAB file
   - Submit for review

### iOS (Apple App Store):

1. **Enroll in Apple Developer Program:**
   - Cost: $99/year
   - https://developer.apple.com/programs/

2. **Configure App in App Store Connect:**
   - https://appstoreconnect.apple.com
   - Create a new app
   - Fill in metadata (screenshots, description, etc.)

3. **Archive and Upload from Xcode:**
   - Product → Archive
   - Once archived, click "Distribute App"
   - Select "App Store Connect"
   - Follow prompts to upload

4. **Submit for Review:**
   - In App Store Connect, complete all required fields
   - Submit for review (typically takes 1-3 days)

---

## Step 10: Update Process

When you make changes to your app:

```bash
# 1. Make changes to your React code
# 2. Build the web app
pnpm build

# 3. Sync to native projects
npx cap sync

# 4. Open and test
npx cap open android  # or ios

# 5. Increment version numbers:
# - Android: android/app/build.gradle (versionCode and versionName)
# - iOS: Open Xcode → Select project → General → Version and Build

# 6. Build and submit updates through respective stores
```

---

## Common Issues and Solutions

### Issue: "Module not found" errors in mobile
**Solution:** Make sure your base URL in `vite.config.ts` is set correctly:
```typescript
export default defineConfig({
  base: './',  // Use relative paths for mobile
  // ...
})
```

### Issue: CORS errors when accessing Firebase
**Solution:** Firebase works fine on mobile. If testing in browser, ensure your domain is whitelisted in Firebase Console → Authentication → Settings → Authorized domains

### Issue: Android build fails with "SDK not found"
**Solution:** Open Android Studio → Tools → SDK Manager → Install latest Android SDK Platform

### Issue: iOS app crashes on launch
**Solution:** Check Console in Xcode for errors. Often related to missing Info.plist permissions.

---

## Next Steps

1. ✅ Install Capacitor and dependencies
2. ✅ Initialize Capacitor in your project
3. ✅ Add Android and/or iOS platforms
4. ✅ Test on emulators/simulators
5. ✅ Test on real devices
6. ✅ Create developer accounts (Google Play / Apple)
7. ✅ Prepare app store assets (icons, screenshots, descriptions)
8. ✅ Submit for review

---

## Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com
- Capacitor Assets Generator: https://github.com/ionic-team/capacitor-assets

---

## Cost Summary

| Service | Cost |
|---------|------|
| Google Play Developer Account | $25 one-time |
| Apple Developer Program | $99/year |
| Total (both platforms) | $124 first year, $99/year after |

**Note:** These are just the store listing fees. You still need the free Firebase, hosting, etc.
