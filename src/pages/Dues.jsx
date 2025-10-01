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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transactions (Dues & Credits)</h1>
      
      <Card title="🎤 AI Voice Search">
        <VoiceSearch
          onSearch={(query) => setFilters(f => ({ ...f, search: query }))}
          placeholder="Search customers by name, ID, email, phone, village..."
        />
      </Card>

      <Card title="Filters">
        <Filters value={filters} onChange={setFilters} villages={Array.from(new Set(items.map(i=>i.village).filter(Boolean)))} karkaanaList={Array.from(new Set(items.map(i=>i.karkaana).filter(Boolean)))} />
      </Card>

      <Card title="Add Due/Credit">
        <form className="grid gap-4 md:grid-cols-5 items-end" onSubmit={submit}>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Customer</label>
            <select className="w-full border rounded-md px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer</option>
              {filteredItems.map(c => <option key={c.id} value={c.id}>{c.name} ({c.customerId})</option>)}
              {items.map((c) => (
                <option key={c.id} value={c.id}>{c.name} • {c.village || '-'} • {c.karkaana || '-'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select className="w-full border rounded-md px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="due">Due</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Amount</label>
            <input type="number" min="0" step="0.01" className="w-full border rounded-md px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="md:col-span-5">
            <label className="block text-sm text-gray-600 mb-1">Note</label>
            <input className="w-full border rounded-md px-3 py-2" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="md:col-span-5">
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md" disabled={!isAdmin}>Add Entry</button>
            {!isAdmin && <span className="ml-3 text-sm text-gray-500">You must be admin to write changes.</span>}
            {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
          </div>
        </form>
      </Card>

      <Card title="Customers Summary">
        <Table
          columns={[
            { header: 'Customer', render: (r) => (
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gray-500">{r.village || '-'} • {r.karkaana || '-'}</div>
              </div>
            ) },
            { header: 'Due', render: (r) => <span className="text-red-600">{formatCurrency(r.totalDue)}</span> },
            { header: 'Credit', render: (r) => <span className="text-green-600">{formatCurrency(r.totalCredit)}</span> },
            { header: 'Balance', render: (r) => formatCurrency(r.balance) },
          ]}
          data={filteredItems}
          empty={loading ? 'Loading...' : 'No customers'}
        />
      </Card>

      {selected && (
        <Card title={`Recent entries for ${selected.name}`}>
          <p className="text-sm text-gray-500">Open a customer's detail page to view full ledger in a future update.</p>
        </Card>
      )}
    </div>
  )
}
