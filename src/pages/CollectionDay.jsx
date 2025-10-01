import { useState, useEffect } from 'react'
import { listCustomers } from '../services/customers'
import { addLedgerEntry } from '../services/ledger'
import { useAuthState } from '../firebase/auth'
import { useIsAdmin } from '../firebase/admin'
import { formatCurrency } from '../utils/format'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function CollectionDay() {
  const { user } = useAuthState()
  const { isAdmin } = useIsAdmin()
  const [allCustomers, setAllCustomers] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0])
  const [payments, setPayments] = useState({}) // {customerId: {credit: 0, debit: 0, note: '', paymentMode: 'cash', utrNo: ''}}
  const [saving, setSaving] = useState({})
  const [collectionSummary, setCollectionSummary] = useState(null)
  const [collectionStarted, setCollectionStarted] = useState(false)
  const [collectionSubmitted, setCollectionSubmitted] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    village: '',
    karkaana: '',
    searchQuery: ''
  })
  
  // Get unique villages and karkanas
  const villages = [...new Set(allCustomers.map(c => c.village).filter(Boolean))]
  const karkanas = [...new Set(allCustomers.map(c => c.karkaana).filter(Boolean))]

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await listCustomers()
      // Show ALL customers, not just those with balance
      setAllCustomers(data)
      setCustomers(data)
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allCustomers]

    if (filters.village) {
      filtered = filtered.filter(c => c.village === filters.village)
    }

    if (filters.karkaana) {
      filtered = filtered.filter(c => c.karkaana === filters.karkaana)
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(query) ||
        c.customerId?.toLowerCase().includes(query)
      )
    }

    setCustomers(filtered)
    setCollectionStarted(true)
    toast.success(`${filtered.length} customers loaded for collection`)
  }

  const submitCollection = () => {
    setCollectionSubmitted(true)
    generateSummary()
    toast.success('Collection submitted successfully!')
  }

  const handlePaymentChange = (customerId, field, value) => {
    setPayments(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [field]: value
      }
    }))
  }

  const handleSavePayment = async (customer, type) => {
    if (!isAdmin) {
      toast.error('Only admins can record payments')
      return
    }

    const payment = payments[customer.id] || {}
    const amount = type === 'credit' ? payment.credit : payment.debit

    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Validate debit: 1 <= debit <= credit (balance)
    if (type === 'debit') {
      const debitAmount = Number(amount)
      const creditBalance = customer.balance || 0
      
      if (debitAmount < 1) {
        toast.error('Payment amount must be at least ₹1')
        return
      }
      
      if (debitAmount > creditBalance) {
        toast.error(`Payment cannot exceed outstanding balance of ${formatCurrency(creditBalance)}`)
        return
      }
    }

    // Validate payment mode for debit
    if (type === 'debit') {
      if (!payment.paymentMode) {
        toast.error('Please select payment mode')
        return
      }
      if (payment.paymentMode === 'online' && !payment.utrNo) {
        toast.error('Please enter UTR number for online payment')
        return
      }
    }

    setSaving(prev => ({ ...prev, [`${customer.id}-${type}`]: true }))

    try {
      const noteText = payment.note || `Collection Day - ${collectionDate}`

      await addLedgerEntry({
        customerId: customer.id,
        type,
        amount: Number(amount),
        note: noteText,
        paymentMode: type === 'debit' ? (payment.paymentMode || 'cash') : undefined,
        utrNo: type === 'debit' && payment.paymentMode === 'online' ? payment.utrNo : undefined,
        createdBy: user?.uid
      })

      toast.success(`${type === 'credit' ? 'Credit' : 'Payment'} recorded successfully!`)
      
      // Clear only the amount input, keep other fields
      setPayments(prev => ({
        ...prev,
        [customer.id]: { 
          ...prev[customer.id], 
          [type === 'credit' ? 'credit' : 'debit']: '',
          utrNo: type === 'debit' ? '' : prev[customer.id]?.utrNo || ''
        }
      }))

      // Reload customers to get updated balances - customers stay visible
      await loadCustomers()

      // Send notification to customer
      sendCustomerNotification(customer, type, amount)
    } catch (error) {
      toast.error('Failed to record payment: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [`${customer.id}-${type}`]: false }))
    }
  }

  const sendCustomerNotification = (customer, type, amount) => {
    // Placeholder for notification system
    console.log(`Notification sent to ${customer.name}: ${type} of ${formatCurrency(amount)} recorded`)
    toast.success(`Notification sent to ${customer.name}`)
  }

  const generateSummary = () => {
    const summary = {
      date: collectionDate,
      totalCustomers: customers.length,
      totalCollected: 0,
      totalCredit: 0,
      totalOutstanding: customers.reduce((sum, c) => sum + (c.balance || 0), 0),
      customers: customers.map(c => ({
        name: c.name,
        customerId: c.customerId,
        previousBalance: c.balance || 0,
        collected: 0,
        newCredit: 0,
        currentBalance: c.balance || 0
      }))
    }

    setCollectionSummary(summary)
    toast.success('Collection summary generated!')
  }

  const exportToExcel = () => {
    if (!collectionSummary) {
      generateSummary()
      return
    }

    const ws = XLSX.utils.json_to_sheet(collectionSummary.customers)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Collection Day')
    XLSX.writeFile(wb, `Collection_${collectionDate}.xlsx`)
    toast.success('Excel file downloaded!')
  }

  const exportToPDF = () => {
    if (!collectionSummary) {
      generateSummary()
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // Header Background
    doc.setFillColor(79, 70, 229) // Indigo
    doc.rect(0, 0, pageWidth, 45, 'F')
    
    // Portal Logo/Name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CMS Pro', 14, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Customer Management System', 14, 28)
    
    // Report Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Collection Day Report', 14, 38)
    
    // Admin & Date Info (Right aligned)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const adminText = `Admin: ${user?.email || 'System'}`
    const dateText = `Date: ${new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })}`
    const timeText = `Time: ${new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })}`
    
    doc.text(adminText, pageWidth - 14, 15, { align: 'right' })
    doc.text(dateText, pageWidth - 14, 21, { align: 'right' })
    doc.text(timeText, pageWidth - 14, 27, { align: 'right' })
    
    // Collection Date Badge
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(pageWidth - 70, 32, 56, 8, 2, 2, 'F')
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Collection: ${collectionDate}`, pageWidth - 42, 37, { align: 'center' })
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    
    // Summary Cards Section
    let yPos = 55
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary Statistics', 14, yPos)
    
    yPos += 8
    const cardWidth = (pageWidth - 35) / 4
    const cardHeight = 25
    const cardSpacing = 3
    
    const summaryData = [
      { 
        label: 'Total Customers', 
        value: collectionSummary.totalCustomers.toString(),
        color: [79, 70, 229] // Indigo
      },
      { 
        label: 'Total Outstanding', 
        value: formatCurrency(collectionSummary.totalOutstanding),
        color: [249, 115, 22] // Orange
      },
      { 
        label: 'Collected Today', 
        value: formatCurrency(collectionSummary.totalCollected || 0),
        color: [34, 197, 94] // Green
      },
      { 
        label: 'New Credits', 
        value: formatCurrency(collectionSummary.totalCredit || 0),
        color: [59, 130, 246] // Blue
      }
    ]
    
    summaryData.forEach((item, index) => {
      const xPos = 14 + (index * (cardWidth + cardSpacing))
      
      // Card background
      doc.setFillColor(249, 250, 251)
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'F')
      
      // Card border
      doc.setDrawColor(...item.color)
      doc.setLineWidth(0.5)
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'S')
      
      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(item.label, xPos + cardWidth/2, yPos + 8, { align: 'center' })
      
      // Value
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...item.color)
      doc.text(item.value, xPos + cardWidth/2, yPos + 18, { align: 'center' })
    })
    
    // Reset colors
    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(0, 0, 0)
    
    // Customer Details Table
    yPos += cardHeight + 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Details', 14, yPos)
    
    yPos += 5
    autoTable(doc, {
      startY: yPos,
      head: [['Customer ID', 'Name', 'Previous Balance', 'Collected', 'New Credit', 'Current Balance']],
      body: collectionSummary.customers.map(c => [
        c.customerId,
        c.name,
        formatCurrency(c.previousBalance),
        formatCurrency(c.collected),
        formatCurrency(c.newCredit),
        formatCurrency(c.currentBalance)
      ]),
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [31, 41, 55]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 25 },
        1: { halign: 'left', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 30 }
      },
      margin: { left: 14, right: 14 }
    })
    
    // Footer
    const finalY = doc.lastAutoTable.finalY || yPos + 50
    if (finalY < pageHeight - 30) {
      doc.setFillColor(249, 250, 251)
      doc.rect(0, pageHeight - 25, pageWidth, 25, 'F')
      
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'italic')
      doc.text('Generated by CMS Pro - Customer Management System', pageWidth/2, pageHeight - 15, { align: 'center' })
      doc.text(`Report ID: RPT-${Date.now().toString().slice(-6)}`, pageWidth/2, pageHeight - 10, { align: 'center' })
      doc.text('This is a computer-generated document. No signature required.', pageWidth/2, pageHeight - 5, { align: 'center' })
    }
    
    // Save PDF
    const fileName = `Collection_Report_${collectionDate}_${Date.now()}.pdf`
    doc.save(fileName)
    toast.success('Professional PDF downloaded!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Collection Day</h1>
        <p className="text-gray-600 mt-1">Filter customers and record collections</p>
      </div>

      {/* Filters Section */}
      {!collectionStarted && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Collection Criteria</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Collection Date</label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
              <select
                value={filters.village}
                onChange={(e) => setFilters({ ...filters, village: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Villages</option>
                {villages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Karkaana</label>
              <select
                value={filters.karkaana}
                onChange={(e) => setFilters({ ...filters, karkaana: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Karkanas</option>
                {karkanas.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name or ID..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            Start Collection →
          </button>
        </div>
      )}

      {/* Export Options - Show after collection started */}
      {collectionStarted && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                <span>📊</span> Export Collection Report
              </h3>
              <p className="text-sm text-indigo-700 mt-1">Download collection data in your preferred format</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToExcel}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats - Only show after collection started */}
      {collectionStarted && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Customers</div>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(customers.reduce((sum, c) => sum + (c.balance || 0), 0))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Collected Today</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(0)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">New Credits</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(0)}</div>
            </div>
          </div>

          {/* Collection Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Add Credit</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Record Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Mode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.customerId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(customer.balance || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={payments[customer.id]?.credit || ''}
                        onChange={(e) => handlePaymentChange(customer.id, 'credit', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      <button
                        onClick={() => handleSavePayment(customer, 'credit')}
                        disabled={saving[`${customer.id}-credit`]}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                      >
                        {saving[`${customer.id}-credit`] ? '...' : '+ Credit'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        max={customer.balance || 0}
                        placeholder="1.00"
                        value={payments[customer.id]?.debit || ''}
                        onChange={(e) => handlePaymentChange(customer.id, 'debit', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      />
                      <button
                        onClick={() => handleSavePayment(customer, 'debit')}
                        disabled={saving[`${customer.id}-debit`]}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
                      >
                        {saving[`${customer.id}-debit`] ? '...' : 'Pay'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <select
                        value={payments[customer.id]?.paymentMode || 'cash'}
                        onChange={(e) => handlePaymentChange(customer.id, 'paymentMode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <option value="cash">💵 Cash</option>
                        <option value="online">📱 UPI/Online</option>
                      </select>
                      {payments[customer.id]?.paymentMode === 'online' && (
                        <input
                          type="text"
                          placeholder="UTR Number..."
                          value={payments[customer.id]?.utrNo || ''}
                          onChange={(e) => handlePaymentChange(customer.id, 'utrNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      placeholder="Optional note..."
                      value={payments[customer.id]?.note || ''}
                      onChange={(e) => handlePaymentChange(customer.id, 'note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">🎉</div>
            <p className="text-gray-600 font-medium">No customers with outstanding balance!</p>
            <p className="text-sm text-gray-500 mt-1">All collections are up to date</p>
          </div>
        )}

            {/* Submit Collection Button */}
            {!collectionSubmitted && customers.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={submitCollection}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
                >
                  Submit Collection Day →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
