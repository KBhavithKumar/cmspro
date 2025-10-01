import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import VoiceSearch from '../components/VoiceSearch'
import { listCustomers } from '../services/customers'
import { addLedgerEntry } from '../services/ledger'
import { useIsAdmin } from '../firebase/admin'
import { useAuthState } from '../firebase/auth'
import { formatCurrency } from '../utils/format'
import { exportToPDF } from '../utils/pdfExport'

export default function Customers() {
  const { user } = useAuthState()
  const { isAdmin } = useIsAdmin()
  
  const [filters, setFilters] = useState({ 
    village: '', 
    karkaana: '', 
    search: '',
    dateFrom: '',
    dateTo: '',
    session: '' // morning, afternoon, evening, night
  })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [transactionModal, setTransactionModal] = useState({ isOpen: false, customer: null })

  // Transaction form
  const [transactionForm, setTransactionForm] = useState({ type: 'due', amount: '', note: '', paymentMode: 'cash' })

  useEffect(() => {
    loadCustomers()
  }, [filters.village, filters.karkaana])

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await listCustomers({
        village: filters.village || undefined,
        karkaana: filters.karkaana || undefined,
      })
      setItems(data)
    } catch (error) {
      toast.error('Failed to load customers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Unique filter lists
  const villages = useMemo(
    () => Array.from(new Set(items.map(c => c.village).filter(Boolean))).sort(),
    [items]
  )
  const karkaanaList = useMemo(
    () => Array.from(new Set(items.map(c => c.karkaana).filter(Boolean))).sort(),
    [items]
  )

  const filteredItems = useMemo(() => {
    let filtered = items

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(search) ||
        item.phoneNo?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.customerId?.toLowerCase().includes(search) ||
        item.village?.toLowerCase().includes(search) ||
        item.karkaana?.toLowerCase().includes(search)
      )
    }

    // Date filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).setHours(0, 0, 0, 0)
      filtered = filtered.filter(item => item.createdAt >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).setHours(23, 59, 59, 999)
      filtered = filtered.filter(item => item.createdAt <= toDate)
    }

    // Session filter
    if (filters.session) {
      filtered = filtered.filter(item => {
        const hour = new Date(item.createdAt).getHours()
        switch (filters.session) {
          case 'morning': return hour >= 6 && hour < 12
          case 'afternoon': return hour >= 12 && hour < 17
          case 'evening': return hour >= 17 && hour < 21
          case 'night': return hour >= 21 || hour < 6
          default: return true
        }
      })
    }

    return filtered
  }, [items, filters])

  const stats = useMemo(() => ({
    total: filteredItems.length,
    totalDue: filteredItems.reduce((sum, c) => sum + (c.totalDue || 0), 0),
    totalCredit: filteredItems.reduce((sum, c) => sum + (c.totalCredit || 0), 0),
    balance: filteredItems.reduce((sum, c) => sum + (c.balance || 0), 0),
  }), [filteredItems])

  async function handleAddTransaction() {
    if (!isAdmin) {
      toast.error('Only admins can add transactions')
      return
    }

    if (!transactionForm.amount || Number(transactionForm.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const loadingToast = toast.loading('Adding transaction...')

    try {
      await addLedgerEntry({
        customerId: transactionModal.customer.id,
        type: transactionForm.type,
        amount: Number(transactionForm.amount),
        note: transactionForm.note,
        paymentMode: transactionForm.type === 'credit' ? transactionForm.paymentMode : undefined,
        createdBy: user?.uid
      })

      const modeText = transactionForm.type === 'credit' 
        ? ` via ${transactionForm.paymentMode === 'cash' ? 'Cash (Offline)' : 'UPI (Online)'}`
        : ''
      
      toast.success(`Transaction added successfully${modeText}!`, { id: loadingToast })
      setTransactionModal({ isOpen: false, customer: null })
      setTransactionForm({ type: 'due', amount: '', note: '', paymentMode: 'cash' })
      loadCustomers()
    } catch (error) {
      toast.error('Failed to add transaction: ' + error.message, { id: loadingToast })
    }
  }

  function handleExportPDF() {
    exportToPDF(filteredItems, filters)
    toast.success('PDF export opened in new window')
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={() => window.location.href = '/customers/new'}
            disabled={!isAdmin}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isAdmin ? 'Admin only' : 'Add new customer'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="text-sm font-medium text-blue-600 mb-1">Total Customers</div>
          <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
          <div className="text-sm font-medium text-red-600 mb-1">Total Due</div>
          <div className="text-3xl font-bold text-red-900">{formatCurrency(stats.totalDue)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="text-sm font-medium text-green-600 mb-1">Total Credit</div>
          <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalCredit)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="text-sm font-medium text-purple-600 mb-1">Net Balance</div>
          <div className="text-3xl font-bold text-purple-900">{formatCurrency(stats.balance)}</div>
        </div>
      </div>

      {/* Voice Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">🎤 AI Voice Search</h3>
        <VoiceSearch
          onSearch={(query) => setFilters(f => ({ ...f, search: query }))}
          placeholder="Search by name, phone, email, village, or karkaana..."
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.village}
              onChange={(e) => setFilters(f => ({ ...f, village: e.target.value }))}
            >
              <option value="">All Villages</option>
              {villages.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Karkaana</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.karkaana}
              onChange={(e) => setFilters(f => ({ ...f, karkaana: e.target.value }))}
            >
              <option value="">All Karkaanas</option>
              {karkaanaList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.dateFrom}
              onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.dateTo}
              onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.session}
              onChange={(e) => setFilters(f => ({ ...f, session: e.target.value }))}
            >
              <option value="">All Sessions</option>
              <option value="morning">🌅 Morning (6AM-12PM)</option>
              <option value="afternoon">☀️ Afternoon (12PM-5PM)</option>
              <option value="evening">🌆 Evening (5PM-9PM)</option>
              <option value="night">🌙 Night (9PM-6AM)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ village: '', karkaana: '', search: '', dateFrom: '', dateTo: '', session: '' })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading customers...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No customers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                          {customer.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.phoneNo || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{customer.village || '-'}</div>
                        <div className="text-gray-500">{customer.karkaana || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {formatCurrency(customer.totalDue || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatCurrency(customer.totalCredit || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(customer.balance || 0)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/customers/${customer.id}`}
                          className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ isOpen: false, customer: null })}
        title={`Add Transaction - ${transactionModal.customer?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTransactionForm(f => ({ ...f, type: 'due' }))}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  transactionForm.type === 'due'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Due</div>
                <div className="text-xs text-gray-500">Customer owes</div>
              </button>
              <button
                onClick={() => setTransactionForm(f => ({ ...f, type: 'credit' }))}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  transactionForm.type === 'credit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Credit</div>
                <div className="text-xs text-gray-500">Customer paid</div>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>
          
          {/* Payment Mode - Only show for Credit (payment received) */}
          {transactionForm.type === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransactionForm(f => ({ ...f, paymentMode: 'cash' }))}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    transactionForm.paymentMode === 'cash'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">💵</span>
                    <div>
                      <div className="font-semibold">Cash</div>
                      <div className="text-xs text-gray-500">Offline</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionForm(f => ({ ...f, paymentMode: 'upi' }))}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    transactionForm.paymentMode === 'upi'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">📱</span>
                    <div>
                      <div className="font-semibold">UPI</div>
                      <div className="text-xs text-gray-500">Online</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
            <textarea
              rows={3}
              placeholder="Add a note..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={transactionForm.note}
              onChange={(e) => setTransactionForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setTransactionModal({ isOpen: false, customer: null })}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTransaction}
              disabled={!transactionForm.amount}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Transaction
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
