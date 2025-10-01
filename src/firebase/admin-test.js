// TEMPORARY ADMIN BYPASS FOR TESTING
// This gives everyone admin access - ONLY FOR DEVELOPMENT!
// Delete this file and use admin.js in production

export function useIsAdmin() {
  // ⚠️ WARNING: This gives EVERYONE admin access!
  // Use this ONLY for testing, then switch back to admin.js
  return { isAdmin: true, loading: false };
}

// To enable this:
// 1. Open src/pages/Dues.jsx
// 2. Change: import { useIsAdmin } from '../firebase/admin'
// 3. To: import { useIsAdmin } from '../firebase/admin-test'
