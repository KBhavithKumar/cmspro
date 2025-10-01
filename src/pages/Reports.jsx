import { useState, useEffect } from 'react'
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport, getReports } from '../services/reports'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import { useIsAdmin } from '../firebase/admin'

export default function Reports() {
  const { isAdmin } = useIsAdmin()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    try {
      const data = await getReports()
      setReports(data)
    } catch (error) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateReport(type) {
    if (!isAdmin) {
      toast.error('Only admins can generate reports')
      return
    }

    setGenerating(true)
    const loadingToast = toast.loading(`Generating ${type} report...`)

    try {
      let report
      if (type === 'daily') {
        report = await generateDailyReport()
      } else if (type === 'weekly') {
        report = await generateWeeklyReport()
      } else if (type === 'monthly') {
        report = await generateMonthlyReport()
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated!`, { id: loadingToast })
      loadReports()
      setSelectedReport(report)
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message, { id: loadingToast })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Auto-generated business reports and analytics</p>
      </div>

      {/* Generate Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleGenerateReport('daily')}
            disabled={generating || !isAdmin}
            className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-2">📅</div>
            <div className="font-semibold text-gray-900">Daily Report</div>
            <div className="text-sm text-gray-600 mt-1">Today's summary</div>
          </button>

          <button
            onClick={() => handleGenerateReport('weekly')}
            disabled={generating || !isAdmin}
            className="p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="font-semibold text-gray-900">Weekly Report</div>
            <div className="text-sm text-gray-600 mt-1">This week's summary</div>
          </button>

          <button
            onClick={() => handleGenerateReport('monthly')}
            disabled={generating || !isAdmin}
            className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-2">📈</div>
            <div className="font-semibold text-gray-900">Monthly Report</div>
            <div className="text-sm text-gray-600 mt-1">This month's summary</div>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium">No reports generated yet</p>
            <p className="text-sm text-gray-500 mt-1">Click a button above to generate your first report</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map(report => (
              <div
                key={report.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      report.reportType === 'daily' ? 'bg-blue-100 text-blue-600' :
                      report.reportType === 'weekly' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {report.reportType === 'daily' ? '📅' : report.reportType === 'weekly' ? '📊' : '📈'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{report.reportId}</div>
                      <div className="text-sm text-gray-600 capitalize">{report.reportType} Report</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Generated: {formatDate(report.generatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(report.summary?.totalBalance || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Total Balance</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedReport.reportId}</h2>
                <p className="text-sm text-gray-600 capitalize">{selectedReport.reportType} Report</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-600 mb-1">Customers</div>
                  <div className="text-2xl font-bold text-blue-900">{selectedReport.summary?.totalCustomers || 0}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-600 mb-1">Total Credit</div>
                  <div className="text-2xl font-bold text-green-900">{formatCurrency(selectedReport.summary?.totalCredit || 0)}</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-orange-600 mb-1">Total Debit</div>
                  <div className="text-2xl font-bold text-orange-900">{formatCurrency(selectedReport.summary?.totalDebit || 0)}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-600 mb-1">Balance</div>
                  <div className="text-2xl font-bold text-purple-900">{formatCurrency(selectedReport.summary?.totalBalance || 0)}</div>
                </div>
              </div>

              {/* Top Customers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Customers</h3>
                <div className="space-y-2">
                  {selectedReport.topCustomers?.map((customer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                        <div className="font-semibold text-blue-600">{formatCurrency(customer.balance)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Village Stats */}
              {selectedReport.villageStats && Object.keys(selectedReport.villageStats).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Village Statistics</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedReport.villageStats).map(([village, stats]) => (
                      <div key={village} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{village}</div>
                          <div className="text-xs text-gray-500">{stats.customerCount} customers</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatCurrency(stats.totalBalance)}</div>
                          <div className="text-xs text-gray-500">Balance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
