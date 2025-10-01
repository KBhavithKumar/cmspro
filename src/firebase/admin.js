import { useEffect, useState } from 'react'
import { auth } from './app'
import { isDefaultAdmin } from './adminAuth'

export function useIsAdmin() {
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const user = auth.currentUser
        if (!user) {
          if (!cancelled) {
            setAdmin(false)
            setLoading(false)
          }
          return
        }
        
        // Check if user is a default admin (email-based login)
        if (user.email && isDefaultAdmin(user.email)) {
          if (!cancelled) {
            setAdmin(true)
            setLoading(false)
          }
          return
        }
        
        // Check custom claims for phone-based users
        const token = await user.getIdTokenResult(true)
        if (!cancelled) {
          setAdmin(!!token.claims?.isAdmin)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setAdmin(false)
          setLoading(false)
        }
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  return { isAdmin: admin, loading }
}
