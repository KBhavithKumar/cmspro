import { useEffect, useState } from 'react'
import Card from '../components/Card'
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
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Total Customers"><div className="text-3xl font-semibold">{stats.customers}</div></Card>
      <Card title="Total Due"><div className="text-3xl font-semibold text-red-600">{formatCurrency(stats.totalDue)}</div></Card>
      <Card title="Total Credit"><div className="text-3xl font-semibold text-green-600">{formatCurrency(stats.totalCredit)}</div></Card>
      <Card title="Net Balance"><div className="text-3xl font-semibold">{formatCurrency(stats.balance)}</div></Card>
      <Card title="Quick Actions" className="md:col-span-2">
        <div className="flex gap-3">
          <Link to="/customers/new" className="px-4 py-2 bg-primary-600 text-white rounded-md">Add Customer</Link>
          <Link to="/customers" className="px-4 py-2 bg-gray-100 rounded-md">View Customers</Link>
          <Link to="/dues" className="px-4 py-2 bg-gray-100 rounded-md">Manage Dues</Link>
          <Link to="/analytics" className="px-4 py-2 bg-gray-100 rounded-md">Analytics</Link>
        </div>
      </Card>
    </div>
  )
}
