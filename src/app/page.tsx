'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/${encodeURIComponent(username.trim())}`);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Typing animation effect
    const timer = setTimeout(() => setIsTyping(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Minimal Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-green-500/40 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="GitHub Activity Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">GitHub Activity</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6">
        {!isClient ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        ) : (
          <div className="py-32">
            {/* Hero Section */}
            <div className="text-center mb-32">
              <div className="mb-8">
                <h2 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none">
                  <span className={`inline-block transition-all duration-1000 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    Transform
                  </span>
                  <br />
                  <span className={`inline-block transition-all duration-1000 delay-300 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">
                      GitHub
                    </span>
                  </span>
                  <br />
                  <span className={`inline-block transition-all duration-1000 delay-600 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                      Activity
                    </span>
                  </span>
                </h2>
              </div>
              
              <p className={`text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-900 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                Generate stunning contribution visualizations and analytics 
                that showcase coding journeys like never before.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className={`max-w-xl mx-auto mb-24 transition-all duration-1000 delay-1200 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-lg backdrop-blur-sm group-hover:border-white/20"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bg-gradient-to-r from-green-500 to-emerald-600 text-black px-8 py-4 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95 text-lg"
                  >
                    Analyze
                  </button>
                </div>
              </form>
            </div>

            {/* Features - Minimal Grid with Hover Effects */}
            <div className={`grid md:grid-cols-3 gap-12 mb-32 transition-all duration-1000 delay-1500 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 border border-white/10 group-hover:border-green-500/30">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Beautiful Charts</h3>
                <p className="text-gray-400 text-base leading-relaxed">
                  Heatmaps, timelines, and language breakdowns that make profiles shine
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 border border-white/10 group-hover:border-emerald-500/30">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Export Ready</h3>
                <p className="text-gray-400 text-base leading-relaxed">
                  Download charts and data perfect for CVs and portfolios
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 border border-white/10 group-hover:border-green-500/30">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real Data</h3>
                <p className="text-gray-400 text-base leading-relaxed">
                  Direct GitHub API integration with authentic metrics
                </p>
              </div>
            </div>

            {/* Minimal CTA with enhanced styling */}
            <div className={`text-center bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-3xl p-16 backdrop-blur-sm transition-all duration-1000 delay-1800 ${isTyping ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <h3 className="text-3xl font-bold text-white mb-6">
                Ready to elevate developer profiles?
              </h3>
              <div className="flex items-center justify-center gap-12 text-base text-gray-300">
                <span className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-green-400 rounded-full group-hover:scale-125 transition-transform"></div>
                  Free forever
                </span>
                <span className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full group-hover:scale-125 transition-transform"></div>
                  No registration
                </span>
                <span className="flex items-center gap-3 group">
                  <div className="w-3 h-3 bg-green-400 rounded-full group-hover:scale-125 transition-transform"></div>
                  Instant results
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 mt-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="GitHub Activity Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-white">GitHub Activity</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Built with Next.js • Open Source • Real GitHub API
          </p>
          <a 
            href="https://github.com/KristiyanTs/github-tracker" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-medium group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="group-hover:underline">View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
