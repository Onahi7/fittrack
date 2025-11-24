# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/24f0051b-ec2e-44f8-b89a-542e884006d7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/24f0051b-ec2e-44f8-b89a-542e884006d7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up Firebase (see FIREBASE_SETUP.md for detailed instructions)
# Create a .env file and add your Firebase credentials
cp .env.example .env

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage)
- Framer Motion (Page Animations)
- Capacitor (Mobile Deployment)

## 📱 Mobile Deployment

Deploy your app to **Android** and **iOS** app stores:

### Quick Start (30 minutes)
```bash
pnpm add @capacitor/core @capacitor/cli @capacitor/android
npx cap init
pnpm build
npx cap add android
npx cap sync
npx cap open android
```

📖 **Full guides:**
- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Step-by-step commands to deploy
- **[MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md)** - Complete deployment guide
- **[QUICK_START_MOBILE.md](./QUICK_START_MOBILE.md)** - Quick reference

### Requirements
- **Android:** Android Studio (FREE), Google Play Developer Account ($25 one-time)
- **iOS:** Xcode + Mac (required), Apple Developer Program ($99/year)

---

## 🔔 Notifications & Reminders

Add **push notifications** and **WhatsApp reminders** to your app:

### Push Notifications (FREE) ⭐
```bash
pnpm add @capacitor/local-notifications @capacitor/push-notifications
```

The notification service is already created in `src/lib/notifications.ts`.

### WhatsApp Reminders (Optional)
Cost: ~$45/month for 100 users via Twilio

📖 **Full guide:** [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

**Recommendation:** Use push notifications (FREE) for testing and MVP. Add WhatsApp later only if users specifically request it.

---

## 🚀 Deployment Options

### Option 1: Web Deployment (Lovable)
Simply open [Lovable](https://lovable.dev/projects/24f0051b-ec2e-44f8-b89a-542e884006d7) and click on Share → Publish.

### Option 2: Mobile Deployment (Android/iOS)
Follow the guides above to deploy to app stores.

### Option 3: Custom Domain
Navigate to Project > Settings > Domains and click Connect Domain.
Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📚 Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase configuration
- **[MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md)** - Android & iOS deployment
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)** - WhatsApp notifications setup
- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Quick deployment commands
- **[QUICK_START_MOBILE.md](./QUICK_START_MOBILE.md)** - Mobile quick reference
