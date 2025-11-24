#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * Verifies that all Firebase environment variables are properly set
 */

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const optionalVars = [
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_RESEND_API_KEY',
  'VITE_APP_URL',
];

console.log('🔍 Checking Firebase Configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('✅ Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '' || value.includes('your_') || value.includes('_here')) {
    console.log(`   ❌ ${varName}: Missing or not configured`);
    hasErrors = true;
  } else {
    console.log(`   ✓ ${varName}: Set`);
  }
});

console.log('\n⚠️  Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '' || value.includes('your_') || value.includes('_here')) {
    console.log(`   ⚠ ${varName}: Not configured`);
    hasWarnings = true;
  } else {
    console.log(`   ✓ ${varName}: Set`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Configuration is incomplete!');
  console.log('\nPlease update your .env file with the correct values.');
  console.log('Get your Firebase config from: https://console.firebase.google.com/\n');
  console.log('Steps:');
  console.log('1. Go to Project Settings');
  console.log('2. Scroll to "Your apps" section');
  console.log('3. Click on your web app');
  console.log('4. Copy the config values to .env\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration is partially complete');
  console.log('\nOptional features may not work without these variables.');
  console.log('You can continue, but some features might be limited.\n');
  process.exit(0);
} else {
  console.log('✅ Configuration looks good!');
  console.log('\nAll Firebase environment variables are set.\n');
  process.exit(0);
}
