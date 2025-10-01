# Customer Management System (CMS)

A complete customer management system built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** (Auth, Firestore with offline persistence).

## Features

- **Phone OTP Authentication** via Firebase Auth
- **Customer Records** with fields: ID, Name, PhoneNo, Village, Karkaana, Due, Credit
- **Add/Edit Customers** with filtering by Village and Karkaana
- **Dues & Credits Management** with admin-only write access
- **Analytics Dashboard** showing summaries by Village and Karkaana
- **Offline Support** via Firestore persistent local cache
- **Modern UI** with Tailwind CSS

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Authentication** → **Phone** provider
4. Create a **Firestore Database** (start in test mode, then deploy the security rules)
5. Copy your Firebase config from **Project Settings** → **General** → **Your apps** → **Web app**

### 3. Add Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

*(Requires [Firebase CLI](https://firebase.google.com/docs/cli) installed and logged in)*

### 5. Set Admin Custom Claims (Optional)

To enable admin features (editing dues/credits), set a custom claim on a user:

```js
// Run this in Firebase Admin SDK or Cloud Functions
admin.auth().setCustomUserClaims(uid, { isAdmin: true });
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for Production

```bash
npm run build
```

Deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

---

## Project Structure

```
CMS/
├── src/
│   ├── components/       # Reusable UI components (Navbar, Card, Table, Filters)
│   ├── firebase/         # Firebase setup (app, auth, admin helpers)
│   ├── models/           # Data types and schemas
│   ├── pages/            # Route pages (Login, Dashboard, Customers, Dues, Analytics)
│   ├── services/         # Firestore services (customers, ledger)
│   ├── utils/            # Utility functions (format currency, dates)
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind imports
├── firestore.rules       # Firestore security rules
├── firebase.json         # Firebase hosting config
├── package.json
├── vite.config.js
├── tailwind.config.cjs
└── README.md
```

---

## Usage

### Login
- Enter your phone number (e.g., `+911234567890`)
- Receive OTP via SMS
- Enter OTP to authenticate

### Add Customer
1. Navigate to **Customers** → **Add Customer**
2. Fill in Name, Phone, Village, Karkaana
3. Save

### Manage Dues & Credits
1. Go to **Dues** page
2. Select a customer
3. Choose type (Due or Credit)
4. Enter amount and optional note
5. Submit (admin only)

### View Analytics
- Navigate to **Analytics** to see summaries grouped by Village and Karkaana

---

## Admin Access

Only users with the `isAdmin` custom claim can:
- Add or edit customer records
- Add due/credit entries

Set this claim via Firebase Admin SDK or Cloud Functions.

---

## Technologies

- **React 18** with Vite
- **React Router 6** for routing
- **Tailwind CSS 3** for styling
- **Firebase 10** (Auth, Firestore with offline persistence)

---

## License

MIT
