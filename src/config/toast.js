export const toastConfig = {
  position: 'top-right',
  duration: 3000,
  style: {
    background: '#ffffff',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    padding: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff',
    },
    style: {
      border: '1px solid #10b981',
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
    style: {
      border: '1px solid #ef4444',
    },
  },
  loading: {
    iconTheme: {
      primary: '#6366f1',
      secondary: '#ffffff',
    },
  },
}
