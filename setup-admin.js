import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const ADMIN_EMAIL = 'bhavithkumar9394@gmail.com'
const ADMIN_PASSWORD = 'Admin@123' // Change this password after first login!

async function cleanupFirestore() {
  console.log('🗑️  Cleaning up Firestore data...')
  
  const collections = ['customers', 'ledger', 'orders', 'reports', 'users']
  
  for (const collectionName of collections) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      console.log(`   Deleting ${querySnapshot.size} documents from ${collectionName}...`)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      console.log(`   ✅ ${collectionName} collection cleaned`)
    } catch (error) {
      console.log(`   ⚠️  Error cleaning ${collectionName}:`, error.message)
    }
  }
  
  console.log('✅ Firestore cleanup complete!\n')
}

async function setupAdmin() {
  try {
    console.log('🚀 Setting up CMS Pro for Production\n')
    console.log('=' .repeat(50))
    
    // Step 1: Clean up existing data
    await cleanupFirestore()
    
    // Step 2: Create admin user
    console.log('👤 Creating admin user...')
    let userCredential
    
    try {
      userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
      console.log('✅ Admin user created successfully!')
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️  Admin user already exists, skipping creation...')
        // Get existing user
        const { getAuth } = await import('firebase/auth')
        const existingAuth = getAuth()
        // You'll need to manually get the UID from Firebase Console
        console.log('   Please verify admin user in Firebase Console')
      } else {
        throw error
      }
    }
    
    // Step 3: Set admin privileges
    if (userCredential) {
      console.log('\n🔑 Setting admin privileges...')
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        email: ADMIN_EMAIL,
        isAdmin: true,
        createdAt: Date.now()
      })
      console.log('✅ Admin privileges set!')
      
      // Step 4: Create user profile
      console.log('\n📝 Creating user profile...')
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: 'Admin User',
        email: ADMIN_EMAIL,
        phone: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      console.log('✅ User profile created!')
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 Setup Complete!')
    console.log('='.repeat(50))
    console.log('\n📋 Admin Credentials:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    console.log('\n🌐 Next Steps:')
    console.log('   1. Deploy to Vercel: vercel --prod')
    console.log('   2. Login with admin credentials')
    console.log('   3. Change password in Profile settings')
    console.log('   4. Start using CMS Pro!')
    console.log('\n✨ Your CMS Pro is ready for production!\n')
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error during setup:', error)
    console.error('\nPlease check:')
    console.error('1. Firebase configuration in .env file')
    console.error('2. Firebase Authentication is enabled')
    console.error('3. Firestore database is created')
    console.error('4. You have internet connection')
    process.exit(1)
  }
}

setupAdmin()
