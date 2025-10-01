// Run this to check if Firebase is configured: node check-setup.js

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔍 Checking Firebase Configuration...\n');

// Check if .env exists
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
  console.log('❌ .env file NOT found!');
  console.log('📝 Create a .env file in the project root with your Firebase config.');
  console.log('📖 See SETUP_GUIDE.md for instructions.\n');
  process.exit(1);
}

// Read .env file
const envContent = readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const config = {};
lines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    config[key.trim()] = value.trim();
  }
});

let allGood = true;

requiredKeys.forEach(key => {
  if (!config[key]) {
    console.log(`❌ Missing: ${key}`);
    allGood = false;
  } else if (config[key].includes('XXXX') || config[key].includes('your-')) {
    console.log(`⚠️  ${key} has placeholder value - replace with actual value`);
    allGood = false;
  } else {
    console.log(`✅ ${key} is set`);
  }
});

if (allGood) {
  console.log('\n✅ Firebase configuration looks good!');
  console.log('🚀 Run: npm run dev\n');
} else {
  console.log('\n❌ Please complete Firebase configuration in .env file');
  console.log('📖 See SETUP_GUIDE.md for help\n');
  process.exit(1);
}
