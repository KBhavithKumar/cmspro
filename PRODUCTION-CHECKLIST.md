# ✅ Production Deployment Checklist

## Pre-Deployment Steps

### 1. Clean Up Data & Set Up Admin
```bash
# Run the setup script to clean data and create admin user
npm run setup-admin
```

This will:
- ✅ Delete all existing customers
- ✅ Delete all ledger entries
- ✅ Delete all orders
- ✅ Delete all reports
- ✅ Delete all user profiles
- ✅ Create admin user: bhavithkumar9394@gmail.com
- ✅ Set admin privileges in Firestore

### 2. Verify Firebase Configuration
- ✅ Check `.env` file has correct Firebase credentials
- ✅ Firebase Authentication is enabled (Email/Password)
- ✅ Firestore Database is created
- ✅ Security rules are deployed: `firebase deploy --only firestore:rules`

### 3. Test Locally
```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

- ✅ Login works with admin credentials
- ✅ All pages load correctly
- ✅ No console errors

## Deployment to Vercel

### Option 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Production ready - CMS Pro"
   git branch -M main
   git remote add origin https://github.com/yourusername/cms-pro.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

## Post-Deployment Verification

### Test These Features:
- ✅ Landing page loads
- ✅ Login with: bhavithkumar9394@gmail.com
- ✅ Dashboard displays correctly
- ✅ Add new customer
- ✅ Record payment (credit/debit)
- ✅ Collection Day functionality
- ✅ Generate reports (Daily/Weekly/Monthly)
- ✅ Export PDF/Excel
- ✅ Profile update
- ✅ Logout and login again

## Security Checklist

- ✅ `.env` file is in `.gitignore` (not pushed to Git)
- ✅ Firebase Security Rules are deployed
- ✅ Only admin can access protected routes
- ✅ Change default password after first login!

## Admin Credentials

**Email:** bhavithkumar9394@gmail.com
**Password:** Admin@123

⚠️ **IMPORTANT:** Change this password immediately after first login!

## Environment Variables for Vercel

If you need to add environment variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## Monitoring

- **Vercel Logs:** https://vercel.com/dashboard → Your Project → Deployments
- **Firebase Console:** https://console.firebase.google.com
- **Analytics:** Firebase Console → Analytics

## Rollback (if needed)

In Vercel Dashboard:
1. Go to Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

## Support

- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support

---

## Quick Commands

```bash
# Setup admin and clean data
npm run setup-admin

# Build for production
npm run build

# Preview locally
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy Firebase rules
firebase deploy --only firestore:rules
```

---

## 🎉 Your CMS Pro is Production Ready!

**Live URL:** https://your-project.vercel.app

**Admin Login:** bhavithkumar9394@gmail.com

**Next Steps:**
1. Login and change password
2. Start adding customers
3. Track payments
4. Generate reports
5. Grow your business! 🚀
