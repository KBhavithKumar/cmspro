import { useState, useEffect } from 'react'
import { listCustomers } from '../services/customers'
import { generateAndSendOTP, verifyOTP } from '../services/otp'
import { sendEmail } from '../services/email'
import toast from 'react-hot-toast'
import { useIsAdmin } from '../firebase/admin'
import { useAuthState } from '../firebase/auth'

export default function EmailCustomers() {
  const { user } = useAuthState()
  const { isAdmin } = useIsAdmin()
  
  const [customers, setCustomers] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Select, 2: Compose, 3: Verify OTP, 4: Send
  
  // Email form
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  })
  
  // OTP verification
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await listCustomers()
      // Show all customers with email addresses (don't require verification for now)
      const customersWithEmail = data.filter(c => c.email && c.email.trim() !== '')
      console.log('Loaded customers:', customersWithEmail.length)
      setCustomers(customersWithEmail)
      
      if (customersWithEmail.length === 0) {
        toast.error('No customers with email addresses found. Please add customer emails first.')
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
      toast.error('Failed to load customers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCustomer = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const selectAll = () => {
    setSelectedCustomers(customers.map(c => c.id))
  }

  const deselectAll = () => {
    setSelectedCustomers([])
  }

  const handleNext = () => {
    if (step === 1 && selectedCustomers.length === 0) {
      toast.error('Please select at least one customer')
      return
    }
    if (step === 2 && (!emailData.subject || !emailData.message)) {
      toast.error('Please fill in subject and message')
      return
    }
    setStep(step + 1)
  }

  const handleSendOTP = async () => {
    if (!user?.email) {
      toast.error('User email not found')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Sending OTP to your email...')

    try {
      const result = await generateAndSendOTP(user.email, 'email-blast')
      
      if (result.success) {
        setOtpSent(true)
        toast.success('OTP sent to your email!', { id: loadingToast })
      } else {
        toast.error(result.error, { id: loadingToast })
      }
    } catch (error) {
      toast.error(error.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndSend = async () => {
    if (!user?.email) {
      toast.error('User email not found')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Verifying OTP...')

    try {
      // Verify OTP
      const verifyResult = await verifyOTP(user.email, otp)
      
      if (!verifyResult.success) {
        toast.error(verifyResult.error, { id: loadingToast })
        return
      }

      toast.success('OTP verified! Sending emails...', { id: loadingToast })

      // Send emails to all selected customers
      const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c.id))
      let successCount = 0
      let failCount = 0

      for (const customer of selectedCustomerData) {
        try {
          await sendEmail({
            to: customer.email,
            subject: emailData.subject,
            body: emailData.message,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">CMS Pro</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <h2 style="color: #111827;">Hello ${customer.name}!</h2>
                  <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${emailData.message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                <div style="background: #111827; padding: 20px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 CMS Pro. All rights reserved.</p>
                </div>
              </div>
            `
          })
          successCount++
        } catch (error) {
          console.error(`Failed to send to ${customer.email}:`, error)
          failCount++
        }
      }

      toast.success(`Emails sent! Success: ${successCount}, Failed: ${failCount}`, { id: loadingToast })
      
      // Reset form
      setStep(1)
      setSelectedCustomers([])
      setEmailData({ subject: '', message: '' })
      setOtp('')
      setOtpSent(false)
      
    } catch (error) {
      toast.error(error.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Only admins can send emails to customers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Customers</h1>
        <p className="text-gray-600 mt-1">Send emails to multiple customers with OTP verification</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Select Customers' },
            { num: 2, label: 'Compose Email' },
            { num: 3, label: 'Verify OTP' },
            { num: 4, label: 'Send' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s.num}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-600'}`}>
                  {s.label}
                </div>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-1 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Customers */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Customers ({selectedCustomers.length} selected)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={customers.length === 0}
                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Deselect All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 font-medium mb-2">No customers with email addresses found</p>
              <p className="text-sm text-gray-500 mb-4">Please add email addresses to your customers first</p>
              <button
                onClick={() => window.location.href = '/customers'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Customers
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {customers.map(customer => (
                  <label
                    key={customer.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => toggleCustomer(customer.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      {customer.village && (
                        <div className="text-xs text-gray-500 mt-1">{customer.village}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{customer.customerId}</div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={selectedCustomers.length === 0}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Compose Email
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Compose Email */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compose Email</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                placeholder="Email subject"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={8}
                placeholder="Your message to customers..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!emailData.subject || !emailData.message}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Next: Verify OTP
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verify OTP */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Identity</h2>
            <p className="text-gray-600 text-sm mb-6">
              For security, we need to verify it's you before sending emails to {selectedCustomers.length} customers.
            </p>

            {!otpSent ? (
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP to My Email'}
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-center text-2xl font-bold tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <button
                  onClick={handleVerifyAndSend}
                  disabled={loading || otp.length !== 6}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending Emails...' : 'Verify & Send Emails'}
                </button>

                <button
                  onClick={handleSendOTP}
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                >
                  Resend OTP
                </button>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Edit Email
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
