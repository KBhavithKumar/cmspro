import { useState, useEffect } from 'react'
import { listCustomers } from '../services/customers'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/app'
import { formatCurrency } from '../utils/format'
import VoiceSearch from '../components/VoiceSearch'

export default function AdvancedAnalytics() {
  const [customers, setCustomers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalBalance: 0,
    avgBalance: 0,
    topCustomers: [],
    recentTransactions: [],
    monthlyTrend: [],
    villageStats: {},
    karkaanaStats: {}
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Load customers
      const customerData = await listCustomers()
      setCustomers(customerData)

      // Load transactions
      const ledgerSnap = await getDocs(collection(db, 'ledger'))
      const transactionData = ledgerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTransactions(transactionData)

      // Calculate analytics
      calculateAnalytics(customerData, transactionData)
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateAnalytics(customerData, transactionData) {
    // Basic stats
    const totalCustomers = customerData.length
    const activeCustomers = customerData.filter(c => c.isActive).length
    
    const totalCredit = customerData.reduce((sum, c) => sum + (c.totalCredit || 0), 0)
    const totalDebit = customerData.reduce((sum, c) => sum + (c.totalDebit || 0), 0)
    const totalBalance = totalCredit - totalDebit
    const avgBalance = totalCustomers > 0 ? totalBalance / totalCustomers : 0

    // Top customers by balance
    const topCustomers = [...customerData]
      .sort((a, b) => (b.balance || 0) - (a.balance || 0))
      .slice(0, 10)

    // Recent transactions
    const recentTransactions = [...transactionData]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 10)

    // Monthly trend (last 6 months)
    const monthlyTrend = calculateMonthlyTrend(transactionData)

    // Village stats
    const villageStats = {}
    customerData.forEach(c => {
      const village = c.village || 'Unknown'
      if (!villageStats[village]) {
        villageStats[village] = { count: 0, totalBalance: 0 }
      }
      villageStats[village].count++
      villageStats[village].totalBalance += c.balance || 0
    })

    // Karkaana stats
    const karkaanaStats = {}
    customerData.forEach(c => {
      const karkaana = c.karkaana || 'Unknown'
      if (!karkaanaStats[karkaana]) {
        karkaanaStats[karkaana] = { count: 0, totalBalance: 0 }
      }
      karkaanaStats[karkaana].count++
      karkaanaStats[karkaana].totalBalance += c.balance || 0
    })

    setAnalytics({
      totalCustomers,
      activeCustomers,
      totalCredit,
      totalDebit,
      totalBalance,
      avgBalance,
      topCustomers,
      recentTransactions,
      monthlyTrend,
      villageStats,
      karkaanaStats
    })
  }

  function calculateMonthlyTrend(transactionData) {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = date.getTime()
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime()
      
      const monthTransactions = transactionData.filter(t => 
        t.createdAt >= monthStart && t.createdAt <= monthEnd
      )
      
      const credit = monthTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const debit = monthTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0)
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        credit,
        debit,
        net: credit - debit
      })
    }
    
    return months
  }

  const handleVoiceSearch = (query) => {
    setSearchQuery(query.toLowerCase())
  }

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true
    return (
      c.name?.toLowerCase().includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery) ||
      c.customerId?.toLowerCase().includes(searchQuery) ||
      c.village?.toLowerCase().includes(searchQuery) ||
      c.karkaana?.toLowerCase().includes(searchQuery)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Voice Search */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h1>
        <VoiceSearch 
          onSearch={handleVoiceSearch}
          placeholder="Search customers by name, email, ID, village, or karkaana..."
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalCustomers}</p>
              <p className="text-sm text-green-600 mt-1">{analytics.activeCustomers} active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credit (Orders)</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{formatCurrency(analytics.totalCredit)}</p>
              <p className="text-sm text-gray-500 mt-1">Amount to be paid</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Debit (Payments)</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(analytics.totalDebit)}</p>
              <p className="text-sm text-gray-500 mt-1">Amount received</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(analytics.totalBalance)}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: {formatCurrency(analytics.avgBalance)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend (Last 6 Months)</h2>
        <div className="space-y-4">
          {analytics.monthlyTrend.map((month, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <span className="text-sm text-gray-600">
                  Net: <span className={month.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(month.net)}
                  </span>
                </span>
              </div>
              <div className="flex gap-2 h-8">
                <div 
                  className="bg-orange-500 rounded flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(month.credit / Math.max(...analytics.monthlyTrend.map(m => Math.max(m.credit, m.debit)))) * 100}%` }}
                >
                  {month.credit > 0 && formatCurrency(month.credit)}
                </div>
                <div 
                  className="bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(month.debit / Math.max(...analytics.monthlyTrend.map(m => Math.max(m.credit, m.debit)))) * 100}%` }}
                >
                  {month.debit > 0 && formatCurrency(month.debit)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">Credit (Orders)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Debit (Payments)</span>
          </div>
        </div>
      </div>

      {/* Top Customers & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Customers by Balance</h2>
          <div className="space-y-3">
            {analytics.topCustomers.map((customer, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.customerId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{formatCurrency(customer.balance || 0)}</div>
                  <div className="text-xs text-gray-500">{customer.village}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Village Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Village Statistics</h2>
          <div className="space-y-3">
            {Object.entries(analytics.villageStats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([village, stats]) => (
                <div key={village} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{village}</div>
                    <div className="text-sm text-gray-500">{stats.count} customers</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(stats.totalBalance)}</div>
                    <div className="text-xs text-gray-500">Total balance</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results for "{searchQuery}" ({filteredCustomers.length} found)
          </h2>
          <div className="space-y-2">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.customerId} • {customer.email}</div>
                  <div className="text-xs text-gray-500">{customer.village} • {customer.karkaana}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{formatCurrency(customer.balance || 0)}</div>
                  <div className="text-xs text-gray-500">Balance</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
