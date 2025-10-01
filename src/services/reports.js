import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/app'
import { listCustomers } from './customers'

const reportsCollection = collection(db, 'reports')

// Generate unique report ID
function generateReportId(count) {
  return `RPT-${String(count + 1).padStart(4, '0')}`
}

// Generate daily report
export async function generateDailyReport() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = today.getTime()
    const endDate = startDate + 24 * 60 * 60 * 1000

    return await generateReport('daily', startDate, endDate)
  } catch (error) {
    console.error('Failed to generate daily report:', error)
    throw error
  }
}

// Generate weekly report
export async function generateWeeklyReport() {
  try {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - dayOfWeek)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    return await generateReport('weekly', startDate.getTime(), endDate.getTime())
  } catch (error) {
    console.error('Failed to generate weekly report:', error)
    throw error
  }
}

// Generate monthly report
export async function generateMonthlyReport() {
  try {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    return await generateReport('monthly', startDate.getTime(), endDate.getTime())
  } catch (error) {
    console.error('Failed to generate monthly report:', error)
    throw error
  }
}

// Generate custom report
export async function generateReport(reportType, startDate, endDate) {
  try {
    // Get report count for ID generation
    const reportsSnap = await getDocs(reportsCollection)
    const reportId = generateReportId(reportsSnap.size)

    // Get all customers
    const customers = await listCustomers()

    // Get transactions in date range
    const transactionsSnap = await getDocs(collection(db, 'ledger'))
    const transactions = transactionsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(t => t.createdAt >= startDate && t.createdAt <= endDate)

    // Get orders in date range
    const ordersSnap = await getDocs(collection(db, 'orders'))
    const orders = ordersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(o => o.createdAt >= startDate && o.createdAt <= endDate)

    // Calculate summary
    const activeCustomers = customers.filter(c => c.isActive).length
    const totalCredit = customers.reduce((sum, c) => sum + (c.totalCredit || 0), 0)
    const totalDebit = customers.reduce((sum, c) => sum + (c.totalDebit || 0), 0)
    const totalBalance = totalCredit - totalDebit

    const completedOrders = orders.filter(o => o.status === 'completed').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length

    // Top customers by balance
    const topCustomers = [...customers]
      .sort((a, b) => (b.balance || 0) - (a.balance || 0))
      .slice(0, 10)
      .map(c => ({
        customerId: c.customerId,
        name: c.name,
        balance: c.balance || 0,
        totalCredit: c.totalCredit || 0,
        totalDebit: c.totalDebit || 0
      }))

    // Village-wise summary
    const villageStats = {}
    customers.forEach(c => {
      const village = c.village || 'Unknown'
      if (!villageStats[village]) {
        villageStats[village] = {
          customerCount: 0,
          totalBalance: 0,
          totalCredit: 0,
          totalDebit: 0
        }
      }
      villageStats[village].customerCount++
      villageStats[village].totalBalance += c.balance || 0
      villageStats[village].totalCredit += c.totalCredit || 0
      villageStats[village].totalDebit += c.totalDebit || 0
    })

    // Transaction summary
    const creditTransactions = transactions.filter(t => t.type === 'credit')
    const debitTransactions = transactions.filter(t => t.type === 'debit')
    const totalCreditAmount = creditTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalDebitAmount = debitTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Create report
    const report = {
      reportId,
      reportType,
      startDate,
      endDate,
      
      summary: {
        totalCustomers: customers.length,
        activeCustomers,
        totalCredit,
        totalDebit,
        totalBalance,
        totalOrders: orders.length,
        completedOrders,
        pendingOrders,
        totalTransactions: transactions.length,
        creditTransactions: creditTransactions.length,
        debitTransactions: debitTransactions.length,
        totalCreditAmount,
        totalDebitAmount
      },
      
      topCustomers,
      villageStats,
      
      generatedAt: Date.now(),
      generatedBy: 'system'
    }

    // Save report
    const docRef = await addDoc(reportsCollection, report)
    
    return { id: docRef.id, ...report }
  } catch (error) {
    console.error('Failed to generate report:', error)
    throw error
  }
}

// Get all reports
export async function getReports(reportType = null) {
  try {
    let q = reportsCollection
    
    if (reportType) {
      q = query(q, where('reportType', '==', reportType))
    }
    
    q = query(q, orderBy('generatedAt', 'desc'))
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Failed to get reports:', error)
    throw error
  }
}

// Get latest report
export async function getLatestReport(reportType = 'daily') {
  try {
    const reports = await getReports(reportType)
    return reports.length > 0 ? reports[0] : null
  } catch (error) {
    console.error('Failed to get latest report:', error)
    throw error
  }
}

// Export report to PDF
export async function exportReportToPDF(reportId) {
  // This will be implemented with PDF generation library
  console.log('Export report to PDF:', reportId)
  // TODO: Implement PDF export
}

// Export report to Excel
export async function exportReportToExcel(reportId) {
  // This will be implemented with Excel generation library
  console.log('Export report to Excel:', reportId)
  // TODO: Implement Excel export
}
