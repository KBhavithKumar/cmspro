// Email Service using EmailJS or custom backend
// For demo, we'll simulate email sending

export async function sendEmail({ to, subject, body, html }) {
  try {
    // In production, integrate with EmailJS, SendGrid, or your backend
    console.log('📧 Email sent:', { to, subject })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendVerificationEmail(email, otp) {
  const subject = 'Verify Your Email - CMS Pro'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">CMS Pro</h1>
        <p style="color: white; margin: 10px 0 0 0;">Customer Management System</p>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #111827; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #4b5563; font-size: 16px;">Your verification code is:</p>
        <div style="background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
      <div style="background: #111827; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 CMS Pro. All rights reserved.</p>
      </div>
    </div>
  `
  
  return sendEmail({ to: email, subject, html })
}

export async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to CMS Pro!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to CMS Pro!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #111827;">Hello ${name}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px;">Thank you for joining CMS Pro. Your account has been successfully created.</p>
        <p style="color: #4b5563; font-size: 16px;">You can now:</p>
        <ul style="color: #4b5563;">
          <li>Manage your transactions</li>
          <li>Track dues and credits</li>
          <li>View order history</li>
          <li>Access detailed reports</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Get Started</a>
        </div>
      </div>
      <div style="background: #111827; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 CMS Pro. All rights reserved.</p>
      </div>
    </div>
  `
  
  return sendEmail({ to: email, subject, html })
}

export async function sendOrderConfirmation(email, orderDetails) {
  const subject = `Order Confirmation - ${orderDetails.orderId}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #111827;">Order #${orderDetails.orderId}</h2>
        <p style="color: #4b5563;">Thank you for your order!</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <th style="text-align: left; padding: 10px; color: #6b7280;">Item</th>
              <th style="text-align: right; padding: 10px; color: #6b7280;">Amount</th>
            </tr>
            ${orderDetails.items.map(item => `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px; color: #111827;">${item.name} x ${item.quantity}</td>
                <td style="text-align: right; padding: 10px; color: #111827;">₹${item.total}</td>
              </tr>
            `).join('')}
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #111827;">Total</td>
              <td style="text-align: right; padding: 10px; font-weight: bold; color: #2563eb;">₹${orderDetails.total}</td>
            </tr>
          </table>
        </div>
      </div>
      <div style="background: #111827; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 CMS Pro. All rights reserved.</p>
      </div>
    </div>
  `
  
  return sendEmail({ to: email, subject, html })
}

export async function sendPaymentReceipt(email, paymentDetails) {
  const subject = `Payment Receipt - ${paymentDetails.transactionId}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Payment Received</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #111827;">Receipt #${paymentDetails.transactionId}</h2>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #4b5563; margin: 10px 0;"><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
          <p style="color: #4b5563; margin: 10px 0;"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
          <p style="color: #4b5563; margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Thank you for your payment!</p>
      </div>
      <div style="background: #111827; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 CMS Pro. All rights reserved.</p>
      </div>
    </div>
  `
  
  return sendEmail({ to: email, subject, html })
}
