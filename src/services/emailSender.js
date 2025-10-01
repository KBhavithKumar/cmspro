// Real email sending service using Gmail SMTP
// This runs on the server side (Node.js)

import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'noreply.eventhive@gmail.com',
    pass: 'xftj bvor rjtx mkta' // Gmail App Password
  }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

/**
 * Send email using Gmail SMTP
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @returns {Promise<Object>} - Send result
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: {
        name: 'CMS Pro',
        address: 'noreply.eventhive@gmail.com'
      },
      to,
      subject,
      text: text || '',
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send verification email with OTP
 */
export async function sendVerificationEmail(email, otp) {
  const subject = 'Verify Your Email - CMS Pro';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
        .footer { background: #111827; padding: 20px; text-align: center; border-radius: 10px; margin-top: 20px; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 CMS Pro</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Hello!</p>
          <p>Thank you for registering with CMS Pro. Please use the following OTP code to verify your email address:</p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
          </div>
          
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br><strong>CMS Pro Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 CMS Pro. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to CMS Pro! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #111827; padding: 20px; text-align: center; border-radius: 10px; margin-top: 20px; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to CMS Pro!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Welcome to CMS Pro - Your complete Customer Management System.</p>
          <p>Your account has been successfully created and verified. You can now:</p>
          <ul>
            <li>✅ Manage customers with unique IDs</li>
            <li>✅ Track transactions (credit/debit)</li>
            <li>✅ Generate reports</li>
            <li>✅ Send bulk emails</li>
            <li>✅ Use AI voice search</li>
          </ul>
          <p>Get started by logging into your account:</p>
          <div style="text-align: center;">
            <a href="${window.location.origin}/login" class="button">Login to CMS Pro</a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br><strong>CMS Pro Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 CMS Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
}

/**
 * Send bulk email to customers
 */
export async function sendBulkEmail(recipients, subject, message) {
  const results = {
    success: [],
    failed: []
  };

  for (const recipient of recipients) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #111827; padding: 20px; text-align: center; border-radius: 10px; margin-top: 20px; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CMS Pro</h1>
          </div>
          <div class="content">
            <h2>Hello ${recipient.name}!</h2>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p>Best regards,<br><strong>CMS Pro Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 CMS Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await sendEmail({
        to: recipient.email,
        subject,
        html
      });

      if (result.success) {
        results.success.push(recipient.email);
      } else {
        results.failed.push(recipient.email);
      }
    } catch (error) {
      results.failed.push(recipient.email);
    }
  }

  return results;
}

export default {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendBulkEmail
};
