import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, orderBy } from 'firebase/firestore'
import { db } from '../firebase/app'
import { Collections } from '../models/types'
import { sanitizeCustomerData, sanitizeSearchQuery } from '../utils/security'

const customersCol = collection(db, Collections.Customers)

export async function createCustomer(payload) {
  // Sanitize input data to prevent injection attacks
  const sanitized = sanitizeCustomerData(payload)
  
  const now = Date.now()
  // Get count for customer ID
  const snapshot = await getDocs(customersCol)
  const customerId = `CUST-${String(snapshot.size + 1).padStart(4, '0')}`
  
  const data = { 
    ...sanitized, 
    customerId,
    totalCredit: 0, 
    totalDebit: 0, 
    balance: 0, 
    createdAt: now, 
    updatedAt: now,
    isActive: true,
    emailVerified: false,
    phoneVerified: false
  }
  
  const ref = await addDoc(customersCol, data)
  return { id: ref.id, ...data }
}

export async function updateCustomer(id, payload) {
  // Sanitize input data
  const sanitized = sanitizeCustomerData(payload)
  
  const ref = doc(db, Collections.Customers, id)
  const data = { ...sanitized, updatedAt: Date.now() }
  await updateDoc(ref, data)
}

export async function getCustomer(id) {
  const ref = doc(db, Collections.Customers, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function listCustomers(filters = {}) {
  // Fetch all customers and filter client-side to avoid index requirements
  const snap = await getDocs(customersCol)
  let customers = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  
  // Apply filters client-side
  if (filters.village) {
    customers = customers.filter(c => c.village === filters.village)
  }
  if (filters.karkaana) {
    customers = customers.filter(c => c.karkaana === filters.karkaana)
  }
  
  // Sort by name client-side
  customers.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
  
  return customers
}

export async function bulkRecomputeBalances(customerIds = []) {
  // Placeholder for server-side function; client can recalc if we tracked ledger sums locally.
  // For now this is a no-op; balances are maintained on write in ledger service.
  return customerIds
}
