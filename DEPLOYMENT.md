# 🚀 Deployment Guide - CMS Pro

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Firebase project configured
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Firebase for Production

### 1.1 Clean Up Firestore Data
Go to Firebase Console → Firestore Database and delete all collections EXCEPT:
- Keep the `admins` collection with only one document:
  - Document ID: `<your-user-id>`
  - Field: `isAdmin: true`
  - Field: `email: "bhavithkumar9394@gmail.com"`

### 1.2 Update Firebase Security Rules
Your security rules are already configured in `firestore.rules`. Deploy them:
```bash
firebase deploy --only firestore:rules
```

### 1.3 Set Up Admin User
1. Go to Firebase Console → Authentication
2. Add user: `bhavithkumar9394@gmail.com`
3. Copy the User UID
4. Go to Firestore Database → `admins` collection
5. Create document with ID = User UID
6. Add field: `isAdmin: true`
7. Add field: `email: "bhavithkumar9394@gmail.com"`

## Step 2: Push to Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CMS Pro ready for production"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/cms-pro.git

# Push to main branch
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables (if any):
   - Click "Environment Variables"
   - Add any required variables from your `.env` file

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? cms-pro
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

## Step 4: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Step 5: Post-Deployment Checklist

✅ Test login with admin account: `bhavithkumar9394@gmail.com`
✅ Verify all pages load correctly
✅ Test customer creation
✅ Test payment tracking
✅ Test report generation
✅ Test collection day functionality
✅ Verify Firebase security rules are working
✅ Check that only admin can access protected features

## Environment Variables (if needed)

If you have any environment variables in `.env`, add them to Vercel:

```bash
# In Vercel Dashboard → Settings → Environment Variables
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... etc
```

## Continuous Deployment

Once connected to Git:
- Every push to `main` branch will automatically deploy to production
- Pull requests will create preview deployments
- You can rollback to any previous deployment from Vercel Dashboard

## Monitoring

- View deployment logs: Vercel Dashboard → Your Project → Deployments
- Monitor Firebase usage: Firebase Console → Usage and billing
- Check errors: Firebase Console → Crashlytics (if enabled)

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy Firebase rules
firebase deploy --only firestore:rules
```

## Production URL

After deployment, your app will be available at:
- Vercel URL: `https://your-project-name.vercel.app`
- Custom domain: `https://your-domain.com` (if configured)

---

**🎉 Congratulations! Your CMS Pro is now live in production!**
