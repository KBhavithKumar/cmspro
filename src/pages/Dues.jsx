import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Card from '../components/Card'
import Table from '../components/Table'
import Filters from '../components/Filters'
import VoiceSearch from '../components/VoiceSearch'
import { listCustomers } from '../services/customers'
import { addLedgerEntry } from '../services/ledger'
import { useAuthState } from '../firebase/auth'
import { useIsAdmin } from '../firebase/admin'
import { formatCurrency, formatDate } from '../utils/format'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function Dues() {
  const query = useQuery()
  const preselectedCustomer = query.get('customerId') || ''

  const [filters, setFilters] = useState({ village: '', karkaana: '', search: '' })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [customerId, setCustomerId] = useState(preselectedCustomer)
  const [type, setType] = useState('due')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('')

  const { user } = useAuthState()
  const { isAdmin } = useIsAdmin()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await listCustomers({
        village: filters.village || undefined,
        karkaana: filters.karkaana || undefined,
      })
      setItems(data)
      setLoading(false)
    }
    load()
  }, [filters])

  const selected = useMemo(() => items.find((c) => c.id === customerId), [items, customerId])

  const submit = async (e) => {
    e.preventDefault()
    setStatus('')
    if (!isAdmin) {
      setStatus('Only admins can add or edit dues/credits.')
      return
    }
    if (!customerId || !amount) return
    
    // Validate: Debit cannot exceed available Credit
    if (type === 'debit') {
      const selectedCustomer = items.find(c => c.id === customerId)
      if (selectedCustomer) {
        const currentBalance = selectedCustomer.balance || 0
        if (Number(amount) > currentBalance) {
          setStatus(`Payment cannot exceed outstanding balance of ${formatCurrency(currentBalance)}`)
          return
        }
      }
    }
    
    try {
      await addLedgerEntry({ customerId, type, amount: Number(amount), note, createdBy: user?.uid })
      setStatus('Entry added and balances updated.')
      setAmount('')
      setNote('')
      // refresh list
      const data = await listCustomers({
        village: filters.village || undefined,
        karkaana: filters.karkaana || undefined,
      })
      setItems(data)
    } catch (e) {
      setStatus(e.message)
    }
  }

  const filteredItems = useMemo(() => {
    if (!filters.search) return items
    const search = filters.search.toLowerCase()
    return items.filter(item =>
      item.name?.toLowerCase().includes(search) ||
      item.customerId?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.phoneNo?.toLowerCase().includes(search) ||
      item.village?.toLowerCase().includes(search) ||
      item.karkaana?.toLowerCase().includes(search)
    )
  }, [items, filters.search])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Manage customer credits and debits</p>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Select customer</option>
                {items.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.village || '-'} • Balance: {formatCurrency(c.balance || 0)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="credit">Credit (Customer owes more)</option>
                <option value="debit">Debit (Payment received)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this transaction"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={!isAdmin}
            >
              Add Transaction
            </button>
            {!isAdmin && (
              <span className="text-sm text-gray-500 self-center">Admin access required</span>
            )}
          </div>

          {status && (
            <p className={`text-sm ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </p>
          )}
        </form>
      </div>

      {/* Customers Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customer Balances</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading customers...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (Owed)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (Paid)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {customer.village && `${customer.village} • `}
                          {customer.customerId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-orange-600 font-medium">
                        {formatCurrency(customer.totalCredit || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-600 font-medium">
                        {formatCurrency(customer.totalDebit || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${
                        (customer.balance || 0) > 0 ? 'text-red-600' :
                        (customer.balance || 0) < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {formatCurrency(customer.balance || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
