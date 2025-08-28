'use client';

import React from 'react';
import Link from 'next/link';
import GitHubAnalytics from '@/components/GitHubAnalytics';
import ClientOnly from '@/components/ClientOnly';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const [username, setUsername] = React.useState<string>('');

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
              <span className="text-gray-400 text-sm">@{username}</span>
              <Link
                href="/"
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                New
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <ClientOnly key={username}>
          <GitHubAnalytics username={username} />
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
