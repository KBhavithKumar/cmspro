import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import ModernNavbar from './components/ModernNavbar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerForm from './pages/CustomerForm'
import CustomerDetails from './pages/CustomerDetails'
import Dues from './pages/Dues'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import EmailCustomers from './pages/EmailCustomers'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import LoadingSpinner from './components/LoadingSpinner'
import { useAuthState } from './firebase/auth'
import { toastConfig } from './utils/theme'

function PrivateRoute({ children }) {
  const { user, loading } = useAuthState()
  if (loading) return <LoadingSpinner fullScreen message="Checking authentication..." />
  return user ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  const { user } = useAuthState()
  
  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <ModernNavbar />
      <main className="lg:ml-64 mt-16 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <>
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
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Customers />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <PrivateRoute>
                <CustomerForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <PrivateRoute>
                <CustomerDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <PrivateRoute>
                <CustomerForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/dues"
            element={
              <PrivateRoute>
                <Dues />
              </PrivateRoute>
            }
          />

          <Route
            path="/advanced-analytics"
            element={
              <PrivateRoute>
                <AdvancedAnalytics />
              </PrivateRoute>
            }
          />

          <Route
            path="/email-customers"
            element={
              <PrivateRoute>
                <EmailCustomers />
              </PrivateRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </>
  )
}
