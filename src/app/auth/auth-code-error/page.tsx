'use client';

import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-green-500/40 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="GitHub Activity Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">GitHub Activity</h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-md mx-auto px-6 py-32">
        <div className="bg-white/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication Error
            </h2>
            
            <p className="text-gray-400 mb-6">
              Something went wrong during the authentication process. This could be due to:
            </p>
            
            <ul className="text-gray-400 text-sm text-left mb-8 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>The authentication request was cancelled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>The authentication code expired</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>An error occurred with the OAuth provider</span>
              </li>
            </ul>
            
            <div className="space-y-4">
              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black py-3 px-6 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95"
              >
                Try Again
              </Link>
              
              <Link
                href="/"
                className="block w-full text-gray-400 hover:text-white transition-colors py-2"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
