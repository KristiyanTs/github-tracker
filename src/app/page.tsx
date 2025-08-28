'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/${encodeURIComponent(username.trim())}`);
    }
  };

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Minimal Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">GitHub Activity</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        {!isClient ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        ) : (
          <div className="py-24">
            {/* Hero Section */}
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Transform Your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  GitHub Activity
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Generate stunning contribution visualizations and analytics 
                that showcase your coding journey like never before.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-20">
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-green-500/25 text-lg"
                  >
                    Analyze
                  </button>
                </div>
              </form>
            </div>

            {/* Features - Minimal Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="text-center group">
                <div className="w-12 h-12 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Beautiful Charts</h3>
                <p className="text-gray-400 text-sm">
                  Heatmaps, timelines, and language breakdowns that make your profile shine
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Export Ready</h3>
                <p className="text-gray-400 text-sm">
                  Download charts and data perfect for CVs and portfolios
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Real Data</h3>
                <p className="text-gray-400 text-sm">
                  Direct GitHub API integration with authentic metrics
                </p>
              </div>
            </div>

            {/* Minimal CTA */}
            <div className="text-center bg-gradient-to-r from-gray-800/30 to-gray-800/10 border border-gray-700/30 rounded-3xl p-12">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ready to elevate your developer profile?
              </h3>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Free forever
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  No registration
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Instant results
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-800/50 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            Built with Next.js • Open Source • Real GitHub API
          </p>
        </div>
      </footer>
    </div>
  );
}
