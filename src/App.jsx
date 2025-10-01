import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useRef } from 'react'
import Sidebar from './components/Sidebar'
import ModernNavbar from './components/ModernNavbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerForm from './pages/CustomerForm'
import CustomerDetails from './pages/CustomerDetails'
import Dues from './pages/Dues'
import CollectionDay from './pages/CollectionDay'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import EmailCustomers from './pages/EmailCustomers'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import { useAuthState } from './firebase/auth'
import { toastConfig } from './config/toast'
import { LanguageProvider } from './context/LanguageContext'

function PrivateRoute({ children }) {
  const { user, loading } = useAuthState()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Login />
  }
  
  return children
}

function AppLayout({ children }) {
  const { user } = useAuthState()
  const sidebarRef = useRef(null)
  
  const handleMenuClick = () => {
    sidebarRef.current?.toggle()
  }
  
  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar ref={sidebarRef} />
      <div className="lg:ml-64 min-h-screen transition-all duration-300">
        <ModernNavbar onMenuClick={handleMenuClick} />
        <main className="pt-24 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Toaster 
        position={toastConfig.position}
        toastOptions={{
          duration: toastConfig.duration,
          style: {
            ...toastConfig.style,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
          success: toastConfig.success,
          error: toastConfig.error,
          loading: toastConfig.loading,
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <AppLayout>
                <Customers />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <CustomerForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <CustomerDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <CustomerForm />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dues"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dues />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/collection-day"
          element={
            <PrivateRoute>
              <AppLayout>
                <CollectionDay />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/advanced-analytics"
          element={
            <PrivateRoute>
              <AppLayout>
                <AdvancedAnalytics />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/email-customers"
          element={
            <PrivateRoute>
              <AppLayout>
                <EmailCustomers />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <AppLayout>
                <Reports />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  )
}
