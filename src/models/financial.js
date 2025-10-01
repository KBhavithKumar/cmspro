// Updated Financial Model
// Total = Amount to be paid (total outstanding)
// Credit = Additional order payment amount (added by admin)
// Debit = Amount given (payment received)

export const FinancialTransactionModel = {
  id: '',
  transactionId: '', // TXN-000001
  customerId: '',
  customerName: '',
  type: '', // 'credit' (order added) or 'debit' (payment received)
  amount: 0,
  orderId: '', // Optional: linked order
  paymentMethod: '', // cash, card, upi, bank
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
  
  // Financial fields (updated terminology)
  totalCredit: 0,      // Total additional orders (amount to be paid)
  totalDebit: 0,       // Total payments received (amount given)
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
