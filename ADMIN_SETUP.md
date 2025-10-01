# 🔐 Admin Accounts Setup Guide

## Default Admin Credentials

Your app now has **4 dedicated admin accounts** with email/password login:

### Admin Account 1 - Super Admin
- **Email:** `admin1@cms.local`
- **Password:** `Admin@123`
- **Role:** Super Admin

### Admin Account 2 - Manager
- **Email:** `admin2@cms.local`
- **Password:** `Admin@456`
- **Role:** Manager

### Admin Account 3 - Accountant
- **Email:** `admin3@cms.local`
- **Password:** `Admin@789`
- **Role:** Accountant

### Admin Account 4 - Supervisor
- **Email:** `admin4@cms.local`
- **Password:** `Admin@012`
- **Role:** Supervisor

---

## How to Create Admin Accounts in Firebase

You need to create these accounts in Firebase Authentication:

### Method 1: Using Firebase Console (Manual - Easiest)

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project: `fcms2025`

2. **Navigate to Authentication:**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

3. **Add Each Admin User:**
   - Click "Add user" button
   - Enter email: `admin1@cms.local`
   - Enter password: `Admin@123`
   - Click "Add user"
   - Repeat for all 4 admin accounts

---

### Method 2: Using Firebase CLI (Automated)

Run this command in your project folder:

```bash
node create-admins.js
```

This will automatically create all 4 admin accounts.

---

## How to Login as Admin

1. **Open your app:** http://localhost:5173

2. **Click "Admin Login" tab**

3. **Enter credentials:**
   - Email: `admin1@cms.local`
   - Password: `Admin@123`

4. **Click "Login as Admin"**

5. **You now have full admin access!**

---

## Admin Privileges

Admins can:
- ✅ View all customers
- ✅ Add/Edit/Delete customers
- ✅ Add due/credit entries
- ✅ Edit existing dues/credits
- ✅ View analytics
- ✅ Filter by Village and Karkaana

Regular users (phone login) can only:
- ✅ View customers
- ✅ View analytics
- ❌ Cannot add/edit customers or dues

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change passwords** before deploying to production
2. **Use strong passwords** (minimum 12 characters)
3. **Store credentials** in environment variables
4. **Enable 2FA** in Firebase Console
5. **Use real email addresses** for password recovery

---

## Troubleshooting

### "User not found" error
- Make sure you created the admin accounts in Firebase Console
- Check that email is exactly: `admin1@cms.local` (no typos)

### "Wrong password" error
- Password is case-sensitive
- Check for extra spaces
- Default passwords are in this document

### "Admin access denied"
- Make sure you're logged in with an admin email
- Check that the email matches one of the 4 default admins

---

## Quick Test

1. Create admin accounts in Firebase Console (Method 1 above)
2. Open app: http://localhost:5173
3. Click "Admin Login"
4. Click "Show Default Admin Credentials"
5. Copy any email/password
6. Login
7. Try adding a customer or due entry - it should work!

---

Need help? Just ask me:
- "How do I create admin accounts?"
- "I can't login as admin"
- "Admin access is not working"
