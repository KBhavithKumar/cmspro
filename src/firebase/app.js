import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, RecaptchaVerifier } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

// Replace the below object with your Firebase project's config in .env or here.
// Prefer environment variables via Vite: import.meta.env.VITE_* keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export const auth = getAuth(app)

export const ensureRecaptcha = (containerId = 'recaptcha-container') => {
  const existing = window.recaptchaVerifier
  if (existing) return existing
  const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  window.recaptchaVerifier = verifier
  return verifier
}

export const subscribeAuth = (cb) => onAuthStateChanged(auth, cb)
