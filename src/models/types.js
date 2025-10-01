// Data shapes used across the app
// Customer: stores profile and current balances summary
// LedgerEntry: normalized transactions with type 'credit' or 'debit'

export const Collections = {
  Customers: 'customers',
  Ledger: 'ledger', // each entry references a customerId
}

export function newCustomerPartial() {
  return {
    name: '',
    phoneNo: '',
    village: '',
    karkaana: '',
    // denormalized summary fields for quick listing
    totalCredit: 0,      // Total orders placed (amount owed)
    totalDebit: 0,       // Total payments received (amount paid)
    balance: 0,          // Outstanding amount (totalCredit - totalDebit)
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function newLedgerEntryPartial() {
  return {
    customerId: '',
    type: 'credit', // 'credit' (customer owes) | 'debit' (payment received)
    amount: 0,
    note: '',
    createdAt: Date.now(),
    createdBy: '', // uid
  }
}
