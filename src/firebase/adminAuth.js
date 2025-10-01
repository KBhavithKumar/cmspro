import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './app'

// Default admin credentials
// In production, store these securely in environment variables
export const DEFAULT_ADMINS = [
  {
    email: 'bhavithkumar9394@gmail.com',
    password: 'Bhavith@123',
    name: 'Bhavith Kumar',
    role: 'Super Admin'
  },
  {
    email: 'admin1@cms.local',
    password: 'Admin@123',
    name: 'Admin One',
    role: 'Super Admin'
  },
  {
    email: 'admin2@cms.local',
    password: 'Admin@456',
    name: 'Admin Two',
    role: 'Manager'
  },
  {
    email: 'admin3@cms.local',
    password: 'Admin@789',
    name: 'Admin Three',
    role: 'Accountant'
  },
  {
    email: 'admin4@cms.local',
    password: 'Admin@012',
    name: 'Admin Four',
    role: 'Supervisor'
  }
]

export async function signInAsAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export function isDefaultAdmin(email) {
  return DEFAULT_ADMINS.some(admin => admin.email === email)
}

export function getAdminByEmail(email) {
  return DEFAULT_ADMINS.find(admin => admin.email === email)
}
