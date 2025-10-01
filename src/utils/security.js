/**
 * Security utilities for input sanitization and validation
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

// Sanitize string input to prevent XSS attacks
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .slice(0, 1000) // Limit length to prevent buffer overflow
}

// Sanitize email input
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return ''
  if (email.trim() === '') return '' // Allow empty email
  
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

// Sanitize phone number
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return ''
  
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '').slice(0, 15)
}

// Sanitize numeric input
export function sanitizeNumber(value, options = {}) {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, decimals = 2 } = options
  
  const num = Number(value)
  
  if (isNaN(num)) return 0
  if (num < min) return min
  if (num > max) return max
  
  return Number(num.toFixed(decimals))
}

// Validate and sanitize customer data
export function sanitizeCustomerData(data) {
  return {
    name: sanitizeInput(data.name || ''),
    email: sanitizeEmail(data.email || ''),
    phoneNo: sanitizePhone(data.phoneNo || ''),
    mobileNo: sanitizePhone(data.mobileNo || ''),
    village: sanitizeInput(data.village || ''),
    karkaana: sanitizeInput(data.karkaana || ''),
  }
}

// Validate and sanitize transaction data
export function sanitizeTransactionData(data) {
  return {
    customerId: sanitizeInput(data.customerId || ''),
    type: ['credit', 'debit'].includes(data.type) ? data.type : 'credit',
    amount: sanitizeNumber(data.amount, { min: 0, max: 10000000 }),
    note: sanitizeInput(data.note || ''),
  }
}

// Prevent SQL injection in search queries
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return ''
  
  return query
    .trim()
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .slice(0, 100) // Limit search query length
}

// Rate limiting helper (client-side)
const rateLimitMap = new Map()

export function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }
  
  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }
  
  record.count++
  rateLimitMap.set(key, record)
  
  return record.count <= maxRequests
}

// Validate Firebase UID format
export function isValidFirebaseUID(uid) {
  if (typeof uid !== 'string') return false
  return /^[a-zA-Z0-9]{28}$/.test(uid)
}

// Validate document ID format
export function isValidDocumentId(id) {
  if (typeof id !== 'string') return false
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id)
}

// Escape HTML to prevent XSS
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// Content Security Policy headers (for reference)
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
  ].join('; ')
}
