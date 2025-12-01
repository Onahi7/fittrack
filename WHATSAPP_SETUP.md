# WhatsApp Reminders Setup Guide

This guide explains how to add WhatsApp reminder functionality to your Fittrack app.

---

## Overview

There are **3 main approaches** to send WhatsApp messages:

### Option 1: Twilio API (Recommended) ⭐
- **Cost:** ~$0.005 per message (~₹0.40)
- **Pros:** Easy to set up, reliable, well-documented
- **Cons:** Requires business verification for production
- **Best for:** Production apps with budget for messaging

### Option 2: WhatsApp Business API (Official)
- **Cost:** Varies by region, typically $0.01-0.05 per message
- **Pros:** Official Meta solution, enterprise-grade
- **Cons:** Complex setup, requires business verification
- **Best for:** Large-scale enterprise applications

### Option 3: Push Notifications (Free Alternative) ✅
- **Cost:** FREE
- **Pros:** No setup cost, works immediately
- **Cons:** Requires app to be installed (not WhatsApp)
- **Best for:** Testing and users who have your app installed

---

## Implementation: Option 1 - Twilio (Recommended)

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial gives you $15 credit)
3. Verify your phone number
4. Complete the onboarding questionnaire

### Step 2: Get WhatsApp Enabled

1. In Twilio Console, go to **Messaging → Try it out → Send a WhatsApp message**
2. You'll get a Twilio Sandbox number (starts with +1)
3. Send "join [your-sandbox-name]" to the Twilio WhatsApp number from your phone
4. Now you can receive test messages

### Step 3: Get API Credentials

From your Twilio Console Dashboard:
- **Account SID:** (looks like `ACxxxxx`)
- **Auth Token:** (click to reveal)
- **WhatsApp Number:** Your Twilio sandbox number (e.g., `+14155238886`)

### Step 4: Create Firebase Cloud Function

Create a new file: `functions/src/index.ts`

\`\`\`typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

admin.initializeApp();

// Twilio credentials (store in Firebase environment variables)
const TWILIO_ACCOUNT_SID = functions.config().twilio.account_sid;
const TWILIO_AUTH_TOKEN = functions.config().twilio.auth_token;
const TWILIO_WHATSAPP_NUMBER = functions.config().twilio.whatsapp_number;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendWhatsAppReminder = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { phoneNumber, message } = data;

  if (!phoneNumber || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number and message are required');
  }

  try {
    const result = await twilioClient.messages.create({
      from: \`whatsapp:\${TWILIO_WHATSAPP_NUMBER}\`,
      to: \`whatsapp:\${phoneNumber}\`,
      body: message
    });

    console.log('WhatsApp message sent:', result.sid);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send WhatsApp message');
  }
});

// Scheduled function to send daily reminders
export const sendDailyReminders = functions.pubsub
  .schedule('0 8,12,18 * * *') // Run at 8am, 12pm, and 6pm daily
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Get all users who have WhatsApp notifications enabled
    const usersSnapshot = await db.collection('userProfiles')
      .where('notificationPreferences.whatsapp', '==', true)
      .get();

    const promises = usersSnapshot.docs.map(async (doc) => {
      const user = doc.data();
      const phoneNumber = user.whatsappNumber;
      
      if (!phoneNumber) return;

      const message = \`🌟 Hi \${user.displayName}! Time to log your meal and stay on track with your health goals. Open Fittrack app now!\`;

      try {
        await twilioClient.messages.create({
          from: \`whatsapp:\${TWILIO_WHATSAPP_NUMBER}\`,
          to: \`whatsapp:\${phoneNumber}\`,
          body: message
        });
        console.log(\`Reminder sent to \${user.displayName}\`);
      } catch (error) {
        console.error(\`Failed to send to \${user.displayName}:\`, error);
      }
    });

    await Promise.all(promises);
    console.log(\`Sent \${promises.length} reminders\`);
  });
\`\`\`

### Step 5: Install Twilio and Deploy

\`\`\`bash
# Navigate to functions directory
cd functions

# Install Twilio
npm install twilio

# Set environment variables
firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID"
firebase functions:config:set twilio.auth_token="YOUR_AUTH_TOKEN"
firebase functions:config:set twilio.whatsapp_number="+14155238886"

# Deploy functions
firebase deploy --only functions
\`\`\`

### Step 6: Update User Profile Interface

Add WhatsApp preferences to `src/lib/userProfile.ts`:

\`\`\`typescript
export interface UserProfile {
  // ... existing fields
  whatsappNumber?: string; // Format: +919876543210
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    whatsapp: boolean;
    reminderTimes: string[]; // ['08:00', '12:00', '18:00']
  };
}
\`\`\`

### Step 7: Add Settings UI

Create a notification settings section in your Profile page where users can:
- Enter their WhatsApp number (with country code)
- Toggle WhatsApp notifications on/off
- Set reminder times

### Step 8: Call the Function from Your App

In your React app:

\`\`\`typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendWhatsAppReminder = httpsCallable(functions, 'sendWhatsAppReminder');

// Send a WhatsApp message
async function sendReminder(phoneNumber: string, message: string) {
  try {
    const result = await sendWhatsAppReminder({ phoneNumber, message });
    console.log('WhatsApp sent:', result.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage:
sendReminder('+919876543210', '🌟 Time to log your meal!');
\`\`\`

---

## Moving to Production (After Testing)

Once you're ready to go live with WhatsApp messaging:

### 1. Request WhatsApp Business Profile Approval

- Contact Twilio Support
- Provide business details (name, website, description)
- Wait for Meta to approve (typically 1-3 weeks)
- You'll get a dedicated WhatsApp Business number

### 2. Upgrade to Paid Account

- Add credit card to your Twilio account
- WhatsApp messages cost ~$0.005-0.01 per message
- Set spending limits to control costs

### 3. Message Templates (Required for Production)

For production, you must use **pre-approved message templates**:

\`\`\`typescript
await twilioClient.messages.create({
  from: 'whatsapp:+14155238886',
  to: 'whatsapp:+919876543210',
  contentSid: 'HXxxxxx', // Your approved template ID
  contentVariables: JSON.stringify({
    '1': 'John', // User's name
    '2': 'breakfast' // Meal type
  })
});
\`\`\`

---

## Alternative: Use Push Notifications (FREE)

If you want to avoid WhatsApp costs, use **Firebase Cloud Messaging (FCM)**:

### Benefits:
- ✅ Completely FREE
- ✅ Works on Android and iOS
- ✅ No approval needed
- ✅ Immediate setup

### Setup:

1. Install Capacitor Push Notifications plugin (already documented in MOBILE_DEPLOYMENT.md)
2. Use the `notifications.ts` library we created
3. Schedule local notifications or send remote notifications via FCM

---

## Cost Comparison

| Solution | Setup Cost | Per Message Cost | Monthly Cost (100 users, 3 msgs/day) |
|----------|------------|------------------|--------------------------------------|
| **Twilio WhatsApp** | Free trial ($15) | $0.005 | ~$45/month |
| **WhatsApp Business API** | $0-1000 | $0.01-0.05 | $90-450/month |
| **Push Notifications (FCM)** | FREE | FREE | FREE |
| **Local Notifications** | FREE | FREE | FREE |

---

## Recommendation

### For Testing/MVP:
✅ Use **Local Notifications** (implemented in `src/lib/notifications.ts`)
- FREE, works immediately
- Good user experience on mobile

### For Production (if you need WhatsApp specifically):
✅ Use **Twilio WhatsApp API**
- Reasonable cost (~$45/month for 100 active users)
- Easy to set up and maintain
- Reliable delivery

### For Budget-Conscious:
✅ Use **Push Notifications via FCM**
- Completely free
- Works just as well for reminders
- Most users prefer app notifications anyway

---

## Next Steps

1. ✅ Decide which notification method to use
2. ✅ If WhatsApp: Create Twilio account and follow setup steps above
3. ✅ If Push: Use the `notifications.ts` file we created
4. ✅ Update user profile to include notification preferences
5. ✅ Add settings UI for users to configure reminders
6. ✅ Test thoroughly before going to production

---

## Additional Resources

- Twilio WhatsApp API: https://www.twilio.com/docs/whatsapp
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Capacitor Local Notifications: https://capacitorjs.com/docs/apis/local-notifications
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
