import { formatCurrency, formatDate } from './format'

export function exportToPDF(customers, filters = {}) {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank')
  
  const filterText = []
  if (filters.village) filterText.push(`Village: ${filters.village}`)
  if (filters.karkaana) filterText.push(`Karkaana: ${filters.karkaana}`)
  const filterString = filterText.length > 0 ? ` (${filterText.join(', ')})` : ''

  const totalDue = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0)
  const totalCredit = customers.reduce((sum, c) => sum + (c.totalCredit || 0), 0)
  const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Customer Report${filterString}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1f2937;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #6366f1;
        }
        .header h1 {
          color: #6366f1;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .header .subtitle {
          color: #6b7280;
          font-size: 14px;
        }
        .filters {
          background: #f3f4f6;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #4b5563;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        }
        .summary-card .label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .summary-card .value {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        .summary-card.due { border-left-color: #ef4444; }
        .summary-card.credit { border-left-color: #10b981; }
        .summary-card.balance { border-left-color: #f59e0b; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #6366f1;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }
        tr:hover { background: #f9fafb; }
        .due { color: #ef4444; font-weight: 500; }
        .credit { color: #10b981; font-weight: 500; }
        .balance { font-weight: 600; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Customer Management Report</h1>
        <div class="subtitle">Generated on ${formatDate(Date.now())}${filterString}</div>
      </div>

      ${filterString ? `<div class="filters">Filters Applied: ${filterText.join(' | ')}</div>` : ''}

      <div class="summary">
        <div class="summary-card">
          <div class="label">Total Customers</div>
          <div class="value">${customers.length}</div>
        </div>
        <div class="summary-card due">
          <div class="label">Total Due</div>
          <div class="value">${formatCurrency(totalDue)}</div>
        </div>
        <div class="summary-card credit">
          <div class="label">Total Credit</div>
          <div class="value">${formatCurrency(totalCredit)}</div>
        </div>
        <div class="summary-card balance">
          <div class="label">Net Balance</div>
          <div class="value">${formatCurrency(totalBalance)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Village</th>
            <th>Karkaana</th>
            <th>Due</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map((customer, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${customer.name || '-'}</td>
              <td>${customer.phoneNo || '-'}</td>
              <td>${customer.village || '-'}</td>
              <td>${customer.karkaana || '-'}</td>
              <td class="due">${formatCurrency(customer.totalDue || 0)}</td>
              <td class="credit">${formatCurrency(customer.totalCredit || 0)}</td>
              <td class="balance">${formatCurrency(customer.balance || 0)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Customer Management System © ${new Date().getFullYear()}</p>
        <p style="margin-top: 5px;">This is a computer-generated report</p>
      </div>

      <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
        <button onclick="window.print()" style="background: #6366f1; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
