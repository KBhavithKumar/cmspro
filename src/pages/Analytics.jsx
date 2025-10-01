import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { listCustomers } from '../services/customers'
import { formatCurrency } from '../utils/format'

export default function Analytics() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const all = await listCustomers()
      setData(all)
      setLoading(false)
    }
    load()
  }, [])

  // Group by Village
  const byVillage = data.reduce((acc, c) => {
    const key = c.village || 'Unknown'
    if (!acc[key]) acc[key] = { count: 0, totalDue: 0, totalCredit: 0, balance: 0 }
    acc[key].count++
    acc[key].totalDue += Number(c.totalDue || 0)
    acc[key].totalCredit += Number(c.totalCredit || 0)
    acc[key].balance += Number(c.balance || 0)
    return acc
  }, {})

  // Group by Karkaana
  const byKarkaana = data.reduce((acc, c) => {
    const key = c.karkaana || 'Unknown'
    if (!acc[key]) acc[key] = { count: 0, totalDue: 0, totalCredit: 0, balance: 0 }
    acc[key].count++
    acc[key].totalDue += Number(c.totalDue || 0)
    acc[key].totalCredit += Number(c.totalCredit || 0)
    acc[key].balance += Number(c.balance || 0)
    return acc
  }, {})

  const totalCustomers = data.length
  const totalDue = data.reduce((s, c) => s + Number(c.totalDue || 0), 0)
  const totalCredit = data.reduce((s, c) => s + Number(c.totalCredit || 0), 0)
  const totalBalance = data.reduce((s, c) => s + Number(c.balance || 0), 0)

  if (loading) return <div>Loading analytics...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total Customers"><div className="text-2xl font-semibold">{totalCustomers}</div></Card>
        <Card title="Total Due"><div className="text-2xl font-semibold text-red-600">{formatCurrency(totalDue)}</div></Card>
        <Card title="Total Credit"><div className="text-2xl font-semibold text-green-600">{formatCurrency(totalCredit)}</div></Card>
        <Card title="Net Balance"><div className="text-2xl font-semibold">{formatCurrency(totalBalance)}</div></Card>
      </div>

      <Card title="By Village">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Village</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(byVillage).map(([k, v]) => (
                <tr key={k}>
                  <td className="px-4 py-3 font-medium">{k}</td>
                  <td className="px-4 py-3">{v.count}</td>
                  <td className="px-4 py-3 text-red-600">{formatCurrency(v.totalDue)}</td>
                  <td className="px-4 py-3 text-green-600">{formatCurrency(v.totalCredit)}</td>
                  <td className="px-4 py-3">{formatCurrency(v.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="By Karkaana">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karkaana</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(byKarkaana).map(([k, v]) => (
                <tr key={k}>
                  <td className="px-4 py-3 font-medium">{k}</td>
                  <td className="px-4 py-3">{v.count}</td>
                  <td className="px-4 py-3 text-red-600">{formatCurrency(v.totalDue)}</td>
                  <td className="px-4 py-3 text-green-600">{formatCurrency(v.totalCredit)}</td>
                  <td className="px-4 py-3">{formatCurrency(v.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
