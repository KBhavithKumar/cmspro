import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { createCustomer, getCustomer, updateCustomer } from '../services/customers'
import { useIsAdmin } from '../firebase/admin'

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const isEdit = !!id
  
  const [form, setForm] = useState({ name: '', email: '', phoneNo: '', village: '', karkaana: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      const loadingToast = toast.loading('Loading customer...')
      try {
        const existing = await getCustomer(id)
        if (existing) {
          setForm({
            name: existing.name || '',
            email: existing.email || '',
            phoneNo: existing.phoneNo || '',
            village: existing.village || '',
            karkaana: existing.karkaana || '',
          })
          toast.success('Customer loaded', { id: loadingToast })
        } else {
          toast.error('Customer not found', { id: loadingToast })
          navigate('/customers')
        }
      } catch (error) {
        toast.error('Failed to load customer: ' + error.message, { id: loadingToast })
      }
    })()
  }, [id, isEdit, navigate])

  const handleChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }))
    // Clear error for this field when user types
    if (errors[k]) {
      setErrors(e => ({ ...e, [k]: null }))
    }
  }

  function validateForm() {
    const newErrors = {}
    
    // Name validation
    if (!form.name || form.name.trim().length === 0) {
      newErrors.name = 'Name is required'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (form.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    // Email validation (optional but validate if provided)
    if (form.email && form.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email.trim())) {
        newErrors.email = 'Invalid email format'
      }
    }

    // Phone validation (optional but validate if provided)
    if (form.phoneNo && form.phoneNo.trim().length > 0) {
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/
      if (!phoneRegex.test(form.phoneNo.trim())) {
        newErrors.phoneNo = 'Invalid phone number format'
      }
    }

    // Village validation (optional but validate if provided)
    if (form.village && form.village.trim().length > 100) {
      newErrors.village = 'Village name too long'
    }

    // Karkaana validation (optional but validate if provided)
    if (form.karkaana && form.karkaana.trim().length > 100) {
      newErrors.karkaana = 'Karkaana name too long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    
    // Check admin access
    if (!isAdmin) {
      toast.error('Only admins can add or edit customers')
      return
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    const savingToast = toast.loading(isEdit ? 'Updating customer...' : 'Creating customer...')
    setLoading(true)
    
    try {
      const cleanedForm = {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNo: form.phoneNo.trim(),
        village: form.village.trim(),
        karkaana: form.karkaana.trim(),
      }

      if (isEdit) {
        await updateCustomer(id, cleanedForm)
        toast.success('Customer updated successfully!', { id: savingToast })
      } else {
        await createCustomer(cleanedForm)
        toast.success('Customer created successfully!', { id: savingToast })
      }
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/customers')
      }, 500)
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Failed to save customer: ' + error.message, { id: savingToast })
    } finally {
      setLoading(false)
    }
  }

  if (adminLoading) {
    return <LoadingSpinner fullScreen message="Checking permissions..." />
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-red-700 mb-4">Only admins can add or edit customers</p>
          <button 
            onClick={() => navigate('/customers')} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            Back to Customers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? 'Update customer information' : 'Create a new customer record'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form className="space-y-5" onSubmit={submit}>
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="customer@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.phoneNo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+91 98765 43210"
              value={form.phoneNo}
              onChange={(e) => handleChange('phoneNo', e.target.value)}
              disabled={loading}
            />
            {errors.phoneNo && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phoneNo}
              </p>
            )}
          </div>

          {/* Village and Karkaana */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.village ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter village"
                value={form.village}
                onChange={(e) => handleChange('village', e.target.value)}
                disabled={loading}
              />
              {errors.village && (
                <p className="mt-1 text-sm text-red-600">{errors.village}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Karkaana</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.karkaana ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter karkaana"
                value={form.karkaana}
                onChange={(e) => handleChange('karkaana', e.target.value)}
                disabled={loading}
              />
              {errors.karkaana && (
                <p className="mt-1 text-sm text-red-600">{errors.karkaana}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEdit ? 'Update Customer' : 'Create Customer'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/customers')}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Name is required and must be at least 2 characters</li>
              <li>Phone number is optional but will be validated if provided</li>
              <li>Village and Karkaana help organize customers for filtering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
