import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = forwardRef((props, ref) => {
  const [collapsed, setCollapsed] = useState(true) // Start collapsed on mobile
  const location = useLocation()

  // Expose toggle function to parent
  useImperativeHandle(ref, () => ({
    toggle: () => setCollapsed(prev => !prev),
    open: () => setCollapsed(false),
    close: () => setCollapsed(true)
  }))

  // Auto-collapse on mobile, auto-expand on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCollapsed(false) // Expand on desktop
      } else {
        setCollapsed(true) // Collapse on mobile
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/customers', icon: '👥', label: 'Customers' },
    { path: '/customers/new', icon: '➕', label: 'Add Customer' },
    { path: '/collection-day', icon: '💵', label: 'Collection Day' },
    { path: '/dues', icon: '💰', label: 'Transactions' },
    { path: '/advanced-analytics', icon: '🎯', label: 'Analytics' },
    { path: '/reports', icon: '📄', label: 'Reports' },
    { path: '/email-customers', icon: '📧', label: 'Email Customers' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 shadow-lg flex flex-col ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-64' : 'translate-x-0 w-64 lg:w-64'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                C
              </div>
              <div>
                <div className="font-bold text-gray-900">CMS Pro</div>
                <div className="text-xs text-gray-500">Customer Manager</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={collapsed ? "Open menu" : "Close menu"}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="font-medium text-sm truncate">{item.label}</span>
              {!collapsed && isActive(item.path) && (
                <span className="ml-auto">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar
