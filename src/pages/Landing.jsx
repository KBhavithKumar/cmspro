import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../firebase/auth'
import { useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthState()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-green-50 overflow-hidden relative">
      {/* Sky Background Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Clouds */}
        <div className="cloud absolute top-20 left-0 text-6xl opacity-80 animate-float">☁️</div>
        <div className="cloud absolute top-40 right-0 text-5xl opacity-70 animate-float-slow">☁️</div>
        <div className="cloud absolute top-60 left-1/4 text-7xl opacity-60 animate-float" style={{animationDelay: '2s'}}>☁️</div>
        <div className="cloud absolute top-80 right-1/3 text-5xl opacity-75 animate-float-slow" style={{animationDelay: '3s'}}>☁️</div>
        <div className="cloud absolute top-32 left-1/2 text-6xl opacity-65 animate-float" style={{animationDelay: '1s'}}>☁️</div>
        
        {/* Flying Birds */}
        <div className="bird absolute top-24 left-10 text-3xl animate-fly">🕊️</div>
        <div className="bird absolute top-36 right-20 text-2xl animate-fly-slow" style={{animationDelay: '1.5s'}}>🕊️</div>
        <div className="bird absolute top-52 left-1/3 text-3xl animate-fly" style={{animationDelay: '3s'}}>🦅</div>
        
        {/* Sun */}
        <div className="absolute top-10 right-10 text-7xl animate-pulse">☀️</div>
        
        {/* Twinkling Stars (day stars) */}
        <div className="absolute top-16 left-20 text-2xl animate-ping opacity-50">⭐</div>
        <div className="absolute top-28 right-40 text-xl animate-pulse opacity-40" style={{animationDelay: '0.5s'}}>✨</div>
        <div className="absolute top-44 left-1/2 text-2xl animate-ping opacity-50" style={{animationDelay: '1s'}}>💫</div>
        
        {/* Butterflies */}
        <div className="absolute top-1/3 left-16 text-3xl animate-flutter">🦋</div>
        <div className="absolute top-1/2 right-24 text-3xl animate-flutter" style={{animationDelay: '1s'}}>🦋</div>
        <div className="absolute bottom-1/3 left-1/4 text-2xl animate-flutter" style={{animationDelay: '2s'}}>🦋</div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(100vw) translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(100vw) translateY(20px); }
        }
        @keyframes fly {
          0% { transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(25vw) translateY(-10px) rotate(-5deg); }
          50% { transform: translateX(50vw) translateY(10px) rotate(5deg); }
          75% { transform: translateX(75vw) translateY(-5px) rotate(-3deg); }
          100% { transform: translateX(100vw) translateY(0) rotate(0deg); }
        }
        @keyframes fly-slow {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(100vw) translateY(-30px); }
        }
        @keyframes flutter {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(10deg); }
          50% { transform: translateY(-10px) rotate(-10deg); }
          75% { transform: translateY(-30px) rotate(5deg); }
        }
        .cloud { animation-duration: 30s; animation-iteration-count: infinite; }
        .animate-float-slow { animation-duration: 40s; animation-iteration-count: infinite; }
        .bird { animation-duration: 20s; animation-iteration-count: infinite; }
        .animate-fly-slow { animation-duration: 25s; animation-iteration-count: infinite; }
        .animate-flutter { animation: flutter 3s ease-in-out infinite; }
      `}</style>

      {/* Red Curtain with White Center Opening Animation */}
      <div className="absolute inset-0 z-50 pointer-events-none curtain-container">
        {/* White Center Background - Revealed as curtains open */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white"></div>
        
        {/* Left Curtain - Red */}
        <div className="curtain-left absolute top-0 left-0 w-1/2 h-full overflow-hidden">
          <div className="curtain-fabric absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-800 via-red-600 to-red-700 shadow-2xl">
            {/* Curtain folds */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)',
            }}></div>
            {/* Gold trim */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 shadow-lg"></div>
            {/* Curtain text */}
            <div className="absolute top-1/2 right-16 transform -translate-y-1/2">
              <div className="text-yellow-200 text-7xl font-bold tracking-wider" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.6)'}}>
                GRAND
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Curtain - Red */}
        <div className="curtain-right absolute top-0 right-0 w-1/2 h-full overflow-hidden">
          <div className="curtain-fabric absolute top-0 right-0 w-full h-full bg-gradient-to-l from-red-800 via-red-600 to-red-700 shadow-2xl">
            {/* Curtain folds */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)',
            }}></div>
            {/* Gold trim */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-l from-yellow-600 via-yellow-400 to-yellow-500 shadow-lg"></div>
            {/* Curtain text */}
            <div className="absolute top-1/2 left-16 transform -translate-y-1/2">
              <div className="text-yellow-200 text-7xl font-bold tracking-wider" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.6)'}}>
                OPENING
              </div>
            </div>
          </div>
        </div>
        
        {/* Sparkle effect at center */}
        <div className="sparkle absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl">✨</div>
      </div>

      <style>{`
        @keyframes curtainOpenLeft {
          0% { 
            transform: translateX(0) scaleX(1);
            border-radius: 0;
          }
          50% {
            transform: translateX(-10%) scaleX(0.95);
          }
          100% { 
            transform: translateX(-120%) scaleX(0.8);
            border-radius: 0 50% 50% 0;
          }
        }
        @keyframes curtainOpenRight {
          0% { 
            transform: translateX(0) scaleX(1);
            border-radius: 0;
          }
          50% {
            transform: translateX(10%) scaleX(0.95);
          }
          100% { 
            transform: translateX(120%) scaleX(0.8);
            border-radius: 50% 0 0 50%;
          }
        }
        @keyframes sparkleGrow {
          0% { 
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(2) rotate(180deg);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        .curtain-left .curtain-fabric {
          animation: curtainOpenLeft 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1s forwards;
        }
        .curtain-right .curtain-fabric {
          animation: curtainOpenRight 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1s forwards;
        }
        .sparkle {
          animation: sparkleGrow 1.5s ease-out 2.5s forwards;
        }
        .curtain-container {
          animation: fadeOut 0.5s ease-in-out 4s forwards;
        }
      `}</style>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-md border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                C
              </div>
              <div>
                <div className="font-bold text-xl text-gray-900">CMS Pro</div>
                <div className="text-xs bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold">Customer Management System</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors font-semibold border border-green-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Grand Opening Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 via-white to-blue-100 border-2 border-green-300 rounded-full px-8 py-4 shadow-xl animate-pulse">
            <span className="text-3xl animate-bounce">🎊</span>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Grand Opening - Dussehra 2025!</span>
            <span className="text-3xl animate-bounce">🎉</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Manage Your
                <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Customers Effortlessly
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Celebrate this Dussehra with powerful tools to manage customers, track payments, 
                and grow your business. Victory over complexity starts here! 🏹
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-2xl transition-all font-bold text-lg flex items-center gap-2"
              >
                Start Free Trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-xl hover:bg-green-50 transition-all font-bold text-lg"
              >
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600">Customers Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">₹50Cr+</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Card */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-green-200">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    👥
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Customer Management</div>
                    <div className="text-sm text-gray-600">Track all customer details</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    💰
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Payment Tracking</div>
                    <div className="text-sm text-gray-600">Credit & Debit management</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    📊
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Advanced Analytics</div>
                    <div className="text-sm text-gray-600">Insights & reports</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    💵
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Collection Day</div>
                    <div className="text-sm text-gray-600">Streamlined collections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-white/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CMS Pro?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your business efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-green-100">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Efficient</h3>
              <p className="text-gray-600">
                Lightning-fast performance with real-time updates. Manage thousands of customers effortlessly.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with Firebase. Your data is encrypted and protected 24/7.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-green-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Friendly</h3>
              <p className="text-gray-600">
                Access from anywhere, any device. Fully responsive design for on-the-go management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join hundreds of businesses celebrating success this Dussehra! 🎉
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-green-600 rounded-xl hover:shadow-2xl transition-all font-bold text-lg"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white font-bold">
                  C
                </div>
                <span className="font-bold text-lg">CMS Pro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional customer management system for modern businesses.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Updates</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>About Us</li>
                <li>Contact</li>
                <li>Support</li>
                <li>Privacy</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Facebook</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 CMS Pro. All rights reserved. Happy Dussehra! 🪔</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
