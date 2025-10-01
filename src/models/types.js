// Data shapes used across the app
// Customer: stores profile and current balances summary
// LedgerEntry: normalized transactions with type 'due' or 'credit'

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
    totalDue: 0,
    totalCredit: 0,
    balance: 0, // positive means customer owes (due - credit)
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function newLedgerEntryPartial() {
  return {
    customerId: '',
    type: 'due', // 'due' | 'credit'
    amount: 0,
    note: '',
    createdAt: Date.now(),
    createdBy: '', // uid
  }
}
