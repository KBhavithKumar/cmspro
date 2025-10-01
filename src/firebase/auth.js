import { useEffect, useState } from 'react'
import { auth, ensureRecaptcha, subscribeAuth } from './app'
import { signInWithPhoneNumber, signOut } from 'firebase/auth'

export const useAuthState = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { user, loading, error }
}

export async function sendOtp(phoneNumber) {
  const verifier = ensureRecaptcha()
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

export async function signOutUser() {
  await signOut(auth)
}
