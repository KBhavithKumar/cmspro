// Enhanced Customer Model with all fields
export const CustomerModel = {
  id: '', // Auto-generated unique ID
  customerId: '', // Custom ID (e.g., CUST-001)
  name: '',
  email: '',
  mobileNo: '',
  village: '',
  karkaana: '',
  totalDue: 0,
  totalCredit: 0,
  balance: 0,
  createdAt: null,
  updatedAt: null,
  createdBy: '',
  isActive: true,
  emailVerified: false,
  phoneVerified: false
}

// Order Model
export const OrderModel = {
  id: '',
  orderId: '', // Custom ID (e.g., ORD-001)
  customerId: '',
  customerName: '',
  items: [], // Array of {name, quantity, price, total}
  subtotal: 0,
  tax: 0,
  total: 0,
  status: 'pending', // pending, processing, completed, cancelled
  paymentStatus: 'unpaid', // unpaid, partial, paid
  paidAmount: 0,
  dueAmount: 0,
  notes: '',
  createdAt: null,
  updatedAt: null,
  createdBy: ''
}

// Transaction Model (Due/Credit)
export const TransactionModel = {
  id: '',
  transactionId: '', // Custom ID (e.g., TXN-001)
  customerId: '',
  customerName: '',
  type: '', // 'due' or 'credit'
  amount: 0,
  orderId: '', // Optional: linked to order
  paymentMethod: '', // cash, card, upi, bank
  note: '',
  createdAt: null,
  createdBy: ''
}

// User Model (for authentication)
export const UserModel = {
  uid: '',
  email: '',
  phoneNumber: '',
  displayName: '',
  role: 'customer', // customer, admin
  emailVerified: false,
  phoneVerified: false,
  isActive: true,
  createdAt: null,
  lastLogin: null
}

// OTP Model
export const OTPModel = {
  id: '',
  email: '',
  phoneNumber: '',
  otp: '',
  type: 'email', // email, phone
  purpose: 'verification', // verification, login, reset
  expiresAt: null,
  verified: false,
  createdAt: null
}

// Generate unique customer ID
export function generateCustomerId(count) {
  return `CUST-${String(count + 1).padStart(4, '0')}`
}

// Generate unique order ID
export function generateOrderId(count) {
  return `ORD-${String(count + 1).padStart(4, '0')}`
}

// Generate unique transaction ID
export function generateTransactionId(count) {
  return `TXN-${String(count + 1).padStart(6, '0')}`
}

// Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone number (Indian format)
export function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/
  return re.test(phone.replace(/\D/g, ''))
}
