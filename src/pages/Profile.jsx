import { useState, useEffect } from 'react'
import { useAuthState } from '../firebase/auth'
import { useIsAdmin } from '../firebase/admin'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/app'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuthState()
  const { isAdmin } = useIsAdmin()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    role: isAdmin ? 'Admin' : 'User'
  })

  // Load user profile data from Firestore
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile()
    }
  }, [user?.uid])

  async function loadUserProfile() {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setFormData(prev => ({
          ...prev,
          displayName: data.displayName || user?.displayName || '',
          phone: data.phone || ''
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error('Display name is required')
      return
    }

    setLoading(true)
    const savingToast = toast.loading('Updating profile...')

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName.trim()
      })

      // Save additional data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName.trim(),
        email: user.email,
        phone: formData.phone.trim(),
        updatedAt: Date.now()
      }, { merge: true })

      toast.success('Profile updated successfully!', { id: savingToast })
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile: ' + error.message, { id: savingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-700"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{formData.displayName || 'Admin User'}</h2>
                <p className="text-gray-600">{formData.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {formData.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Account Created</div>
          <div className="text-2xl font-bold text-gray-900">
            {new Date(user?.metadata?.creationTime).toLocaleDateString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Last Sign In</div>
          <div className="text-2xl font-bold text-gray-900">
            {new Date(user?.metadata?.lastSignInTime).toLocaleDateString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Account Status</div>
          <div className="text-2xl font-bold text-green-600">Active</div>
        </div>
      </div>
    </div>
  )
}
