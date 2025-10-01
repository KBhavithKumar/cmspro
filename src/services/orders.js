import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/app'
import { generateOrderId } from '../models/customer'
import { sendOrderConfirmation } from './email'

const ordersCollection = collection(db, 'orders')

// Create new order
export async function createOrder(orderData) {
  try {
    // Get count for order ID
    const snapshot = await getDocs(ordersCollection)
    const orderId = generateOrderId(snapshot.size)
    
    const order = {
      ...orderData,
      orderId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    const docRef = await addDoc(ordersCollection, order)
    
    // Send confirmation email if customer has email
    if (orderData.customerEmail) {
      await sendOrderConfirmation(orderData.customerEmail, order)
    }
    
    return { id: docRef.id, ...order }
  } catch (error) {
    throw new Error('Failed to create order: ' + error.message)
  }
}

// Get order by ID
export async function getOrder(id) {
  const docRef = doc(db, 'orders', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) return null
  
  return { id: snapshot.id, ...snapshot.data() }
}

// Get orders by customer
export async function getOrdersByCustomer(customerId) {
  const q = query(
    ordersCollection,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Get all orders
export async function getAllOrders(filters = {}) {
  let q = ordersCollection
  
  if (filters.status) {
    q = query(q, where('status', '==', filters.status))
  }
  
  if (filters.paymentStatus) {
    q = query(q, where('paymentStatus', '==', filters.paymentStatus))
  }
  
  q = query(q, orderBy('createdAt', 'desc'))
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Update order status
export async function updateOrderStatus(id, status) {
  const docRef = doc(db, 'orders', id)
  await updateDoc(docRef, {
    status,
    updatedAt: Date.now()
  })
}

// Update payment status
export async function updatePaymentStatus(id, paymentStatus, paidAmount) {
  const docRef = doc(db, 'orders', id)
  const order = await getOrder(id)
  
  const dueAmount = order.total - paidAmount
  
  await updateDoc(docRef, {
    paymentStatus,
    paidAmount,
    dueAmount,
    updatedAt: Date.now()
  })
}
