// Script to create default admin accounts in Firebase
// Run: node create-admins.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { config } from 'dotenv';

// Load environment variables
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const admins = [
  { email: 'bhavithkumar9394@gmail.com', password: 'Bhavith@123', name: 'Bhavith Kumar', role: 'Super Admin' },
  { email: 'admin1@cms.local', password: 'Admin@123', name: 'Admin One', role: 'Super Admin' },
  { email: 'admin2@cms.local', password: 'Admin@456', name: 'Admin Two', role: 'Manager' },
  { email: 'admin3@cms.local', password: 'Admin@789', name: 'Admin Three', role: 'Accountant' },
  { email: 'admin4@cms.local', password: 'Admin@012', name: 'Admin Four', role: 'Supervisor' },
];

async function createAdmins() {
  console.log('\n🔐 Creating Admin Accounts...\n');

  for (const admin of admins) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
      console.log(`✅ Created: ${admin.name} (${admin.email})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Already exists: ${admin.name} (${admin.email})`);
      } else {
        console.log(`❌ Error creating ${admin.name}: ${error.message}`);
      }
    }
  }

  console.log('\n✅ Admin account creation complete!');
  console.log('\n📋 Admin Credentials:');
  admins.forEach((admin, idx) => {
    console.log(`\n${idx + 1}. ${admin.name} (${admin.role})`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
  });
  console.log('\n🚀 You can now login with these credentials!\n');
  process.exit(0);
}

createAdmins().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
