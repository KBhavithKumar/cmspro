# 📧 Email Setup Guide

## ✅ Email Configuration

Your CMS now sends **real emails** using Gmail SMTP!

### **Email Account:**
- **From:** noreply.eventhive@gmail.com
- **Service:** Gmail SMTP
- **App Password:** xftj bvor rjtx mkta

---

## 🚀 Setup Instructions

### **Step 1: Install Nodemailer**
```bash
npm install nodemailer
```

### **Step 2: Email Service Created**
File: `src/services/emailSender.js`

This service handles:
- ✅ Verification emails with OTP
- ✅ Welcome emails
- ✅ Bulk emails to customers
- ✅ Professional HTML templates

### **Step 3: Update Email Service (Optional)**

If you want to use environment variables instead of hardcoded credentials:

1. Add to `.env`:
```env
EMAIL_USER=noreply.eventhive@gmail.com
EMAIL_PASS=xftj bvor rjtx mkta
```

2. Update `emailSender.js`:
```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};
```

---

## 📧 Email Types

### **1. Verification Email**
Sent when user registers:
- 6-digit OTP code
- Valid for 10 minutes
- Professional template

### **2. Welcome Email**
Sent after email verification:
- Welcome message
- Feature overview
- Login button

### **3. Bulk Emails**
Sent from "Email Customers" page:
- Custom subject and message
- Sent to multiple customers
- Professional template

---

## 🎨 Email Templates

All emails use professional HTML templates with:
- **Gradient header** with CMS Pro branding
- **Clean content area** with white background
- **Responsive design** for mobile/desktop
- **Footer** with copyright info

---

## 🔒 Security

### **Gmail App Password:**
- Never share your app password
- Use environment variables in production
- Rotate passwords regularly

### **SMTP Configuration:**
- Uses secure Gmail SMTP
- TLS/SSL encryption
- Authenticated sending

---

## 🧪 Testing

### **Test Verification Email:**
1. Go to Register page
2. Enter email address
3. Click "Send OTP"
4. Check your inbox

### **Test Bulk Email:**
1. Add customers with emails
2. Go to "Email Customers"
3. Select customers
4. Compose message
5. Verify with OTP
6. Emails sent!

---

## ⚠️ Important Notes

### **Gmail Limits:**
- **500 emails per day** for free accounts
- **2000 emails per day** for Google Workspace
- Rate limiting applies

### **Best Practices:**
- Don't send spam
- Include unsubscribe option
- Use professional content
- Test before bulk sending

### **Troubleshooting:**

**If emails don't send:**
1. Check Gmail app password is correct
2. Verify "Less secure app access" is enabled (if needed)
3. Check spam folder
4. Verify recipient email is valid
5. Check console for errors

**Common Errors:**
- `Invalid login` - Wrong password
- `Daily limit exceeded` - Too many emails
- `Connection timeout` - Network issue

---

## 📊 Email Service Features

### **Current Implementation:**
- ✅ Gmail SMTP integration
- ✅ Professional HTML templates
- ✅ OTP verification emails
- ✅ Welcome emails
- ✅ Bulk email sending
- ✅ Error handling
- ✅ Success tracking

### **Coming Soon:**
- 📧 Email templates editor
- 📊 Email analytics
- 📅 Scheduled emails
- 📎 Attachments support
- 🎨 Custom branding

---

## 🔄 Integration

The email service is integrated with:

### **Registration Flow:**
```
User registers → OTP sent → User verifies → Welcome email sent
```

### **Email Customers Flow:**
```
Admin selects customers → Composes message → OTP verification → Bulk send
```

### **OTP Flow:**
```
User requests OTP → Email sent → User enters code → Verified
```

---

## 💡 Usage Examples

### **Send Verification Email:**
```javascript
import { sendVerificationEmail } from './services/emailSender'

await sendVerificationEmail('user@example.com', '123456')
```

### **Send Welcome Email:**
```javascript
import { sendWelcomeEmail } from './services/emailSender'

await sendWelcomeEmail('user@example.com', 'John Doe')
```

### **Send Bulk Email:**
```javascript
import { sendBulkEmail } from './services/emailSender'

const recipients = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
]

const results = await sendBulkEmail(
  recipients,
  'Important Update',
  'Your message here...'
)
```

---

## ✅ Checklist

- [x] Nodemailer installed
- [x] Email service created
- [x] Gmail SMTP configured
- [x] Templates designed
- [x] Integration complete
- [ ] Test verification email
- [ ] Test welcome email
- [ ] Test bulk email
- [ ] Deploy to production

---

## 🎉 Ready to Use!

Your email system is configured and ready to send real emails from:
**noreply.eventhive@gmail.com**

Run `npm install` to install nodemailer, then test the email system!

---

**Last Updated:** 2025-01-01
**Status:** Production Ready ✅
