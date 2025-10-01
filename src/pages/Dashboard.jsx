import { useEffect, useState } from 'react'
import { listCustomers } from '../services/customers'
import { formatCurrency } from '../utils/format'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, totalDue: 0, totalCredit: 0, balance: 0 })

  useEffect(() => {
    async function load() {
      const all = await listCustomers()
      const customers = all.length
      const totalDue = all.reduce((s, c) => s + Number(c.totalDue || 0), 0)
      const totalCredit = all.reduce((s, c) => s + Number(c.totalCredit || 0), 0)
      const balance = all.reduce((s, c) => s + Number(c.balance || 0), 0)
      setStats({ customers, totalDue, totalCredit, balance })
    }
    load()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your customer management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.customers}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Credit (Owed)</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{formatCurrency(stats.totalDue)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Debit (Paid)</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalCredit)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Net Balance</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{formatCurrency(stats.balance)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/customers/new" className="flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-500 hover:shadow-md transition-all">
            <span className="text-4xl">➕</span>
            <span className="text-sm font-semibold text-gray-700">Add Customer</span>
          </Link>
          <Link to="/customers" className="flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-500 hover:shadow-md transition-all">
            <span className="text-4xl">👥</span>
            <span className="text-sm font-semibold text-gray-700">View Customers</span>
          </Link>
          <Link to="/dues" className="flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-500 hover:shadow-md transition-all">
            <span className="text-4xl">💸</span>
            <span className="text-sm font-semibold text-gray-700">Manage Dues</span>
          </Link>
          <Link to="/advanced-analytics" className="flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-500 hover:shadow-md transition-all">
            <span className="text-4xl">📈</span>
            <span className="text-sm font-semibold text-gray-700">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
