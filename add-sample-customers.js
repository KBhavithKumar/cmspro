// Script to add sample customers with complete details
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

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
const db = getFirestore(app);

// Sample customers with complete details
const sampleCustomers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    mobileNo: '+91 9876543210',
    village: 'Mumbai',
    karkaana: 'Karkaana One'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    mobileNo: '+91 9876543211',
    village: 'Delhi',
    karkaana: 'Karkaana Two'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    mobileNo: '+91 9876543212',
    village: 'Ahmedabad',
    karkaana: 'Karkaana One'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    mobileNo: '+91 9876543213',
    village: 'Hyderabad',
    karkaana: 'Karkaana Three'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    mobileNo: '+91 9876543214',
    village: 'Jaipur',
    karkaana: 'Karkaana Two'
  },
  {
    name: 'Anita Desai',
    email: 'anita.desai@example.com',
    mobileNo: '+91 9876543215',
    village: 'Pune',
    karkaana: 'Karkaana One'
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    mobileNo: '+91 9876543216',
    village: 'Bangalore',
    karkaana: 'Karkaana Four'
  },
  {
    name: 'Kavita Joshi',
    email: 'kavita.joshi@example.com',
    mobileNo: '+91 9876543217',
    village: 'Chennai',
    karkaana: 'Karkaana Three'
  },
  {
    name: 'Suresh Nair',
    email: 'suresh.nair@example.com',
    mobileNo: '+91 9876543218',
    village: 'Kochi',
    karkaana: 'Karkaana Two'
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com',
    mobileNo: '+91 9876543219',
    village: 'Coimbatore',
    karkaana: 'Karkaana One'
  }
];

// Generate customer ID
function generateCustomerId(count) {
  return `CUST-${String(count + 1).padStart(4, '0')}`;
}

async function addSampleCustomers() {
  console.log('\n🎯 Adding Sample Customers...\n');

  try {
    // Login as admin first
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'bhavithkumar9394@gmail.com', 'Bhavith@123');
    console.log('✅ Authenticated successfully!\n');

    // Get current customer count
    const customersSnap = await getDocs(collection(db, 'customers'));
    let count = customersSnap.size;

    for (const customer of sampleCustomers) {
      const customerId = generateCustomerId(count);
      
      const customerData = {
        ...customer,
        customerId,
        totalCredit: 0,
        totalDebit: 0,
        balance: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system',
        isActive: true,
        emailVerified: false,
        phoneVerified: false
      };

      await addDoc(collection(db, 'customers'), customerData);
      console.log(`✅ Added: ${customerId} - ${customer.name} (${customer.email})`);
      count++;
    }

    console.log(`\n✅ Successfully added ${sampleCustomers.length} sample customers!\n`);
    console.log('📧 All customers have email addresses for testing the email system.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding customers:', error);
    process.exit(1);
  }
}

addSampleCustomers();
