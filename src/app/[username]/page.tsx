'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GitHubAnalytics from '@/components/GitHubAnalytics';
import ClientOnly from '@/components/ClientOnly';
import ExportDropdown from '@/components/ExportDropdown';
import { GitHubAnalytics as GitHubAnalyticsType } from '@/types/github';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const [username, setUsername] = React.useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<GitHubAnalyticsType | null>(null);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  React.useEffect(() => {
    params.then(({ username }) => {
      setUsername(username);
    });
  }, [params]);

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">GitHub Activity</h1>
            </Link>
            <div className="flex items-center gap-4">
              {/* Action Buttons - Only show when data is available */}
              {analyticsData && (
                <>
                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setShowShareSuccess(true);
                      setTimeout(() => setShowShareSuccess(false), 2000);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                    title="Copy current URL to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    {showShareSuccess ? 'Copied!' : 'Share'}
                  </button>
                  
                  {/* Export Dropdown */}
                  <ExportDropdown data={analyticsData} />
                </>
              )}
              
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

              <main className="max-w-4xl mx-auto px-6 py-8">
          <ClientOnly key={username}>
            <GitHubAnalytics 
              username={username} 
              onDataLoaded={setAnalyticsData}
            />
          </ClientOnly>
        </main>

      {/* Footer */}
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
