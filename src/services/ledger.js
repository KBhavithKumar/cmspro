import { addDoc, collection, doc, increment, query, where, getDocs, orderBy, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/app'
import { Collections } from '../models/types'
import { sanitizeTransactionData, isValidDocumentId, isValidFirebaseUID } from '../utils/security'

const ledgerCol = collection(db, Collections.Ledger)

export async function addLedgerEntry({ customerId, type, amount, note, paymentMode, utrNo, createdBy }) {
  // Validate and sanitize input
  if (!isValidDocumentId(customerId)) {
    throw new Error('Invalid customer ID')
  }
  
  if (createdBy && !isValidFirebaseUID(createdBy)) {
    throw new Error('Invalid user ID')
  }
  
  const sanitized = sanitizeTransactionData({ customerId, type, amount, note })
  
  const batch = writeBatch(db)
  const customerRef = doc(db, Collections.Customers, customerId)

  // Create ledger entry with full details including payment mode
  const entryRef = doc(collection(db, Collections.Ledger))
  const now = Date.now()
  const timestamp = new Date(now)
  
  const entry = {
    customerId: sanitized.customerId,
    type: sanitized.type, // 'credit' (customer owes) or 'debit' (payment received)
    amount: sanitized.amount,
    note: sanitized.note || '',
    
    // Payment details (mandatory for debit transactions)
    paymentMode: type === 'debit' ? (paymentMode || 'cash') : null,
    utrNo: type === 'debit' && paymentMode === 'online' ? (utrNo || '') : null,
    
    // Timestamp details (mandatory)
    date: timestamp.toISOString().split('T')[0], // YYYY-MM-DD
    time: timestamp.toLocaleTimeString('en-IN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }), // HH:MM:SS
    timestamp: now, // Unix timestamp
    createdAt: now,
    createdBy: createdBy || null,
  }
  batch.set(entryRef, entry)

  // Update customer financials - Balance = Credit - Debit
  const deltaCredit = type === 'credit' ? Number(amount) : 0
  const deltaDebit = type === 'debit' ? Number(amount) : 0
  const deltaBalance = deltaCredit - deltaDebit

  batch.update(customerRef, {
    totalCredit: increment(deltaCredit),
    totalDebit: increment(deltaDebit),
    balance: increment(deltaBalance),
    updatedAt: now,
  })

  await batch.commit()
  return { id: entryRef.id, ...entry }
}

export async function listLedgerByCustomer(customerId) {
  // Fetch all ledger entries for customer and sort client-side to avoid index requirement
  const q = query(ledgerCol, where('customerId', '==', customerId))
  const snap = await getDocs(q)
  const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Sort by createdAt descending (newest first)
  return entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}
