import { addDoc, collection, doc, increment, query, where, getDocs, orderBy, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/app'
import { Collections } from '../models/types'

const ledgerCol = collection(db, Collections.Ledger)

export async function addLedgerEntry({ customerId, type, amount, note, createdBy }) {
  const batch = writeBatch(db)
  const customerRef = doc(db, Collections.Customers, customerId)

  // Create ledger entry
  const entryRef = doc(collection(db, Collections.Ledger))
  const entry = {
    customerId,
    type,
    amount: Number(amount),
    note: note || '',
    createdAt: Date.now(),
    createdBy: createdBy || null,
  }
  batch.set(entryRef, entry)

  // Update summary fields on customer
  const deltaDue = type === 'due' ? Number(amount) : 0
  const deltaCredit = type === 'credit' ? Number(amount) : 0
  const deltaBalance = deltaDue - deltaCredit

  batch.update(customerRef, {
    totalDue: increment(deltaDue),
    totalCredit: increment(deltaCredit),
    balance: increment(deltaBalance),
    updatedAt: Date.now(),
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
