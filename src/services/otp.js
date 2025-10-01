import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/app'
import { generateOTP } from '../models/customer'
import { sendVerificationEmail } from './email'

const otpCollection = collection(db, 'otps')

// Generate and send OTP
export async function generateAndSendOTP(email, purpose = 'verification') {
  try {
    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    // Save OTP to database
    const otpData = {
      email,
      otp,
      type: 'email',
      purpose,
      expiresAt,
      verified: false,
      createdAt: Date.now()
    }
    
    await addDoc(otpCollection, otpData)
    
    // Send email
    await sendVerificationEmail(email, otp)
    
    return { success: true, message: 'OTP sent to your email' }
  } catch (error) {
    console.error('OTP generation error:', error)
    return { success: false, error: error.message }
  }
}

// Verify OTP
export async function verifyOTP(email, otp) {
  try {
    const q = query(
      otpCollection,
      where('email', '==', email),
      where('otp', '==', otp),
      where('verified', '==', false)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return { success: false, error: 'Invalid OTP' }
    }
    
    const otpDoc = snapshot.docs[0]
    const otpData = otpDoc.data()
    
    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      return { success: false, error: 'OTP expired' }
    }
    
    // Mark as verified
    await updateDoc(doc(db, 'otps', otpDoc.id), {
      verified: true,
      verifiedAt: Date.now()
    })
    
    return { success: true, message: 'OTP verified successfully' }
  } catch (error) {
    console.error('OTP verification error:', error)
    return { success: false, error: error.message }
  }
}

// Resend OTP
export async function resendOTP(email, purpose = 'verification') {
  return generateAndSendOTP(email, purpose)
}
