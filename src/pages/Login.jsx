import { useState } from 'react'
import { sendOtp } from '../firebase/auth'
import { signInAsAdmin, DEFAULT_ADMINS } from '../firebase/adminAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [loginMode, setLoginMode] = useState('admin')
  
  // Phone OTP states
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  
  // Admin login states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showAdminList, setShowAdminList] = useState(false)
  const [loading, setLoading] = useState(false)

  const startOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading('Sending OTP...')
    try {
      const conf = await sendOtp(phone)
      setConfirmation(conf)
      toast.success('OTP sent to your phone!', { id: loadingToast })
    } catch (e) {
      if (e.code === 'auth/billing-not-enabled') {
        toast.error('Phone authentication requires Firebase Blaze plan. Please use Admin Login.', { id: loadingToast })
      } else {
        toast.error(e.message, { id: loadingToast })
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading('Verifying OTP...')
    try {
      await confirmation.confirm(code)
      toast.success('Login successful!', { id: loadingToast })
      navigate('/')
    } catch (e) {
      toast.error('Invalid OTP code', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading('Logging in...')
    try {
      const result = await signInAsAdmin(email, password)
      if (result.success) {
        toast.success('Login successful!', { id: loadingToast })
        navigate('/')
      } else {
        toast.error(result.error, { id: loadingToast })
      }
    } catch (e) {
      toast.error(e.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CMS Pro</h1>
          <p className="text-gray-600">Customer Management System</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
          {/* Login Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMode('phone')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                loginMode === 'phone'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📱 Phone Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('admin')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                loginMode === 'admin'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔐 Admin Login
            </button>
          </div>

          {/* Phone OTP Login Form */}
          {loginMode === 'phone' && (
            <form className="space-y-5" onSubmit={confirmation ? verifyOtp : startOtp}>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold mb-1">Phone OTP Unavailable</p>
                    <p>Phone authentication requires Firebase Blaze plan. Please use <strong>Admin Login</strong> instead.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              {confirmation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-center text-2xl font-bold tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              )}
              <div id="recaptcha-container"></div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3.5 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : confirmation ? 'Verify OTP' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Admin Email/Password Login Form */}
          {loginMode === 'admin' && (
            <form className="space-y-5" onSubmit={handleAdminLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="admin@cms.local"
                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3.5 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : 'Login as Admin'}
              </button>
              
              {/* Show Admin Credentials Button */}
              <button
                type="button"
                onClick={() => setShowAdminList(!showAdminList)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showAdminList ? 'Hide' : 'Show'} Default Admin Credentials
              </button>

              {/* Admin Credentials List */}
              {showAdminList && (
                <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-100 animate-scale-in">
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Default Admin Accounts
                  </p>
                  <div className="space-y-3">
                    {DEFAULT_ADMINS.map((admin, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{admin.name}</div>
                            <div className="text-xs text-gray-500">{admin.role}</div>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-16">Email:</span>
                            <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{admin.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-16">Password:</span>
                            <span className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{admin.password}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Development Only!</strong> Change these credentials in production.</span>
                    </p>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 animate-fade-in">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register here
            </button>
          </p>
          <p className="mt-2">© 2025 CMS Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
