// Simplified Financial Model - Only Credit & Debit
// Credit: Amount customer owes (orders placed)
// Debit: Amount customer paid

export const FinancialTransactionModel = {
  id: '',
  transactionId: '', // TXN-000001
  customerId: '',
  customerName: '',
  type: '', // 'credit' or 'debit' only
  amount: 0,
  note: '',
  createdAt: null,
  createdBy: '',

  // Balance tracking
  previousBalance: 0,
  newBalance: 0
}

export const CustomerFinancialModel = {
  id: '',
  customerId: 'CUST-0001',
  name: '',
  email: '',
  mobileNo: '',
  village: '',
  karkaana: '',

  // Financial fields - simplified
  totalCredit: 0,      // Total orders placed (amount owed)
  totalDebit: 0,       // Total payments received (amount paid)
  balance: 0,          // Outstanding amount (totalCredit - totalDebit)

  createdAt: null,
  updatedAt: null,
  createdBy: '',
  isActive: true,
  emailVerified: false,
  phoneVerified: false
}

// Calculate balance
export function calculateBalance(totalCredit, totalDebit) {
  return totalCredit - totalDebit
}

// Format transaction type for display
export function formatTransactionType(type) {
  return {
    credit: 'Order Added (Credit)',
    debit: 'Payment Received (Debit)'
  }[type] || type
}

// Get transaction color
export function getTransactionColor(type) {
  return {
    credit: 'text-orange-600 bg-orange-50',
    debit: 'text-green-600 bg-green-50'
  }[type] || 'text-gray-600 bg-gray-50'
}
