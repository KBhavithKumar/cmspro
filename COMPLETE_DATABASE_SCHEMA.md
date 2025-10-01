# 📊 Complete Database Schema

## 🗄️ Database Structure

### **1. Customers Collection**
```javascript
Collection: customers
Document ID: Auto-generated Firebase ID

{
  // Unique Identifiers
  id: "firebase-auto-id",
  customerId: "CUST-0001",  // Auto-generated unique ID
  
  // Personal Information
  name: "John Doe",
  email: "john@example.com",
  mobileNo: "+91 9876543210",
  
  // Location
  village: "Mumbai",
  karkaana: "Karkaana One",
  
  // Financial Summary (Auto-calculated)
  totalCredit: 5000,    // Total orders/dues
  totalDebit: 3000,     // Total payments
  balance: 2000,        // totalCredit - totalDebit
  
  // Metadata
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
  createdBy: "admin-uid",
  isActive: true,
  emailVerified: false,
  phoneVerified: false
}
```

### **2. Transactions Collection**
```javascript
Collection: transactions
Document ID: Auto-generated Firebase ID

{
  // Unique Identifiers
  id: "firebase-auto-id",
  transactionId: "TXN-000001",  // Auto-generated
  
  // Customer Reference (IMPORTANT!)
  customerId: "CUST-0001",      // Links to customer
  customerName: "John Doe",      // Cached for display
  
  // Transaction Details
  type: "credit",               // "credit" (order) or "debit" (payment)
  amount: 1000,
  
  // Optional References
  orderId: "ORD-0001",         // If linked to order
  paymentMethod: "cash",        // cash, card, upi, bank
  note: "Payment for order",
  
  // Balance Tracking
  previousBalance: 1000,
  newBalance: 2000,
  
  // Metadata
  createdAt: 1704067200000,
  createdBy: "admin-uid"
}
```

### **3. Orders Collection**
```javascript
Collection: orders
Document ID: Auto-generated Firebase ID

{
  // Unique Identifiers
  id: "firebase-auto-id",
  orderId: "ORD-0001",         // Auto-generated
  
  // Customer Reference (IMPORTANT!)
  customerId: "CUST-0001",     // Links to customer
  customerName: "John Doe",     // Cached
  customerEmail: "john@example.com",
  
  // Order Items
  items: [
    {
      name: "Product A",
      quantity: 2,
      price: 500,
      total: 1000
    }
  ],
  
  // Financial
  subtotal: 1000,
  tax: 180,
  total: 1180,
  
  // Status
  status: "pending",           // pending, processing, completed, cancelled
  paymentStatus: "unpaid",     // unpaid, partial, paid
  paidAmount: 0,
  dueAmount: 1180,
  
  // Notes
  notes: "Delivery instructions",
  
  // Metadata
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
  createdBy: "admin-uid"
}
```

### **4. Reports Collection (Auto-generated)**
```javascript
Collection: reports
Document ID: Auto-generated Firebase ID

{
  // Report Info
  id: "firebase-auto-id",
  reportId: "RPT-0001",
  reportType: "daily",         // daily, weekly, monthly, yearly
  
  // Date Range
  startDate: 1704067200000,
  endDate: 1704153600000,
  
  // Summary Data
  summary: {
    totalCustomers: 100,
    activeCustomers: 85,
    totalCredit: 50000,
    totalDebit: 30000,
    totalBalance: 20000,
    totalOrders: 150,
    completedOrders: 120,
    pendingOrders: 30
  },
  
  // Top Customers
  topCustomers: [
    {
      customerId: "CUST-0001",
      name: "John Doe",
      balance: 5000,
      orders: 10
    }
  ],
  
  // Metadata
  generatedAt: 1704067200000,
  generatedBy: "system"
}
```

---

## 🔄 Data Flow

### **Adding a Customer:**
```
1. Admin fills form
2. System generates customerId: CUST-0001
3. Save to customers collection
4. Initialize: totalCredit=0, totalDebit=0, balance=0
```

### **Creating an Order:**
```
1. Admin creates order
2. System generates orderId: ORD-0001
3. Link to customerId: CUST-0001
4. Save to orders collection
5. Create transaction (type: credit)
6. Update customer balance
```

### **Recording Payment:**
```
1. Admin records payment
2. System generates transactionId: TXN-000001
3. Link to customerId: CUST-0001
4. Type: debit
5. Save to transactions collection
6. Update customer balance
```

### **Auto-generating Reports:**
```
1. Scheduled task (daily/weekly/monthly)
2. Query all customers
3. Query all transactions
4. Query all orders
5. Calculate summaries
6. Generate reportId: RPT-0001
7. Save to reports collection
```

---

## 📋 Sample Data

### **Customer:**
```json
{
  "customerId": "CUST-0001",
  "name": "John Doe",
  "email": "john@example.com",
  "mobileNo": "+91 9876543210",
  "village": "Mumbai",
  "karkaana": "Karkaana One",
  "totalCredit": 5000,
  "totalDebit": 3000,
  "balance": 2000,
  "createdAt": 1704067200000
}
```

### **Transaction:**
```json
{
  "transactionId": "TXN-000001",
  "customerId": "CUST-0001",
  "customerName": "John Doe",
  "type": "credit",
  "amount": 1000,
  "orderId": "ORD-0001",
  "previousBalance": 1000,
  "newBalance": 2000,
  "createdAt": 1704067200000
}
```

### **Order:**
```json
{
  "orderId": "ORD-0001",
  "customerId": "CUST-0001",
  "customerName": "John Doe",
  "items": [
    {"name": "Product A", "quantity": 2, "price": 500, "total": 1000}
  ],
  "total": 1180,
  "status": "completed",
  "paymentStatus": "paid",
  "createdAt": 1704067200000
}
```

---

## ✅ Key Points

1. **Customer ID is the PRIMARY reference** for all transactions and orders
2. **All IDs are auto-generated** (CUST-0001, TXN-000001, ORD-0001)
3. **Customer balance is auto-calculated** from transactions
4. **Reports are auto-generated** on schedule
5. **Each collection is separate** but linked by Customer ID

---

## 🚀 Implementation Status

- ✅ Customer model defined
- ✅ Transaction model defined
- ✅ Order model defined
- ✅ Report model defined
- ✅ ID generation functions
- ✅ Customer service with unique IDs
- 🔄 Need to implement report generation
- 🔄 Need to add sample customers
