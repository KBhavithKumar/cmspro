import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    customers: 'Customers',
    addCustomer: 'Add Customer',
    transactions: 'Transactions',
    analytics: 'Analytics',
    reports: 'Reports',
    emailCustomers: 'Email Customers',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    
    // Customer Management
    totalCustomers: 'Total Customers',
    totalCredit: 'Total Credit (Owed)',
    totalDebit: 'Total Debit (Paid)',
    balance: 'Balance',
    
    // Transactions
    credit: 'Credit',
    debit: 'Debit',
    amount: 'Amount',
    date: 'Date',
    time: 'Time',
    note: 'Note',
    addTransaction: 'Add Transaction',
    customerOwesMore: 'Customer owes more',
    paymentReceived: 'Payment received',
  },
  te: {
    // Navigation (Telugu)
    dashboard: 'డాష్‌బోర్డ్',
    customers: 'కస్టమర్లు',
    addCustomer: 'కస్టమర్ జోడించండి',
    transactions: 'లావాదేవీలు',
    analytics: 'విశ్లేషణ',
    reports: 'నివేదికలు',
    emailCustomers: 'కస్టమర్లకు ఇమెయిల్',
    
    // Common (Telugu)
    search: 'వెతకండి',
    filter: 'ఫిల్టర్',
    export: 'ఎగుమతి',
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    delete: 'తొలగించు',
    edit: 'సవరించు',
    view: 'చూడండి',
    
    // Customer Management (Telugu)
    totalCustomers: 'మొత్తం కస్టమర్లు',
    totalCredit: 'మొత్తం క్రెడిట్ (బాకీ)',
    totalDebit: 'మొత్తం డెబిట్ (చెల్లించబడింది)',
    balance: 'బ్యాలెన్స్',
    
    // Transactions (Telugu)
    credit: 'క్రెడిట్',
    debit: 'డెబిట్',
    amount: 'మొత్తం',
    date: 'తేదీ',
    time: 'సమయం',
    note: 'గమనిక',
    addTransaction: 'లావాదేవీ జోడించండి',
    customerOwesMore: 'కస్టమర్ మరింత బాకీ',
    paymentReceived: 'చెల్లింపు స్వీకరించబడింది',
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    
    // Update document language and font
    document.documentElement.lang = language
    if (language === 'te') {
      document.body.style.fontFamily = "'Noto Sans Telugu', 'Poppins', sans-serif"
    } else {
      document.body.style.fontFamily = "'Inter', 'Poppins', sans-serif"
    }
  }, [language])

  const t = (key) => {
    return translations[language][key] || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
