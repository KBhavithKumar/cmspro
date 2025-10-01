import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getCustomer } from '../services/customers'
import { addLedgerEntry, listLedgerByCustomer } from '../services/ledger'
import { useIsAdmin } from '../firebase/admin'
import { useAuthState } from '../firebase/auth'
import { formatCurrency, formatDate } from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'
import CustomModal from '../components/CustomModal'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthState()
  const { isAdmin } = useIsAdmin()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Transaction form
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    type: 'credit',
    amount: '',
    note: '',
    paymentMode: 'cash',
    utrNo: ''
  })
  
  // Custom modals
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    try {
      console.log('Loading customer:', id)
      
      // Load customer data
      const customerData = await getCustomer(id)
      console.log('Customer data:', customerData)
      
      if (!customerData) {
        toast.error('Customer not found')
        navigate('/customers')
        return
      }
      
      setCustomer(customerData)
      
      // Load transactions
      try {
        const ledgerData = await listLedgerByCustomer(id)
        console.log('Ledger data:', ledgerData)
        setTransactions(ledgerData.sort((a, b) => b.createdAt - a.createdAt))
      } catch (ledgerError) {
        console.error('Ledger error:', ledgerError)
        // Continue even if ledger fails
        setTransactions([])
      }
      
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Failed to load customer details: ' + error.message)
      navigate('/customers')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTransaction() {
    if (!isAdmin) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Access Denied',
        message: 'Only admins can add transactions'
      })
      return
    }

    if (!transactionForm.amount || Number(transactionForm.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Validate: 1 <= Debit <= Credit (Balance)
    if (transactionForm.type === 'debit') {
      const debitAmount = Number(transactionForm.amount)
      const currentBalance = customer.balance || 0
      
      if (debitAmount < 1) {
        toast.error('Payment amount must be at least ₹1')
        return
      }
      
      if (debitAmount > currentBalance) {
        toast.error(`Payment cannot exceed outstanding balance of ${formatCurrency(currentBalance)}`)
        return
      }
    }

    const savingToast = toast.loading('Adding transaction...')
    
    try {
      await addLedgerEntry({
        customerId: id,
        type: transactionForm.type,
        amount: Number(transactionForm.amount),
        note: transactionForm.note,
        paymentMode: transactionForm.type === 'debit' ? transactionForm.paymentMode : undefined,
        utrNo: transactionForm.type === 'debit' && transactionForm.paymentMode === 'online' ? transactionForm.utrNo : undefined,
        createdBy: user?.uid
      })

      toast.success('Transaction added successfully!', { id: savingToast })
      setShowTransactionModal(false)
      setTransactionForm({ type: 'credit', amount: '', note: '' })
      
      // Show success modal
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Transaction Added!',
      })
      
      loadData()
    } catch (error) {
      toast.error('Failed to add transaction: ' + error.message, { id: savingToast })
      console.error('Add transaction error:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading customer details..." />
  }

  if (!customer) {
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-sm text-gray-500 mt-1">View transactions and manage account</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        )}
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-2xl font-bold">
              {customer.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-gray-600">{customer.phoneNo || 'No phone'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>📍 {customer.village || 'N/A'}</span>
                <span>🏭 {customer.karkaana || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Credit (Owed)</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(customer.totalDue || 0)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Debit (Paid)</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalCredit || 0)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Balance</div>
            <div className={`text-2xl font-bold ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(customer.balance || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <p className="text-sm text-gray-500 mt-1">{transactions.length} transactions</p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Add a transaction to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.type === 'credit' ? 'Order Added (Credit)' : 'Payment Received (Debit)'}
                      </div>
                      {transaction.note && (
                        <div className="text-sm text-gray-500 mt-0.5">{transaction.note}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      transaction.type === 'credit' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTransactionModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Transaction</h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTransactionForm(f => ({ ...f, type: 'credit' }))}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        transactionForm.type === 'credit'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">Credit</div>
                      <div className="text-xs text-gray-500">Customer owes more</div>
                    </button>
                    <button
                      onClick={() => setTransactionForm(f => ({ ...f, type: 'debit' }))}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        transactionForm.type === 'debit'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">Debit</div>
                      <div className="text-xs text-gray-500">Payment received</div>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(f => ({ ...f, amount: e.target.value }))}
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add a note..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    value={transactionForm.note}
                    onChange={(e) => setTransactionForm(f => ({ ...f, note: e.target.value }))}
                  />
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  disabled={!transactionForm.amount}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  )
}
