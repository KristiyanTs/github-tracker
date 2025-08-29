'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GitHubAnalytics from '@/components/GitHubAnalytics';
import ClientOnly from '@/components/ClientOnly';
import ExportDropdown from '@/components/ExportDropdown';
import { useAuth } from '@/lib/auth-context';
import { GitHubAnalytics as GitHubAnalyticsType } from '@/types/github';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const [username, setUsername] = React.useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<GitHubAnalyticsType | null>(null);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    params.then(({ username }) => {
      setUsername(username);
    });
  }, [params]);

  const saveProfile = async () => {
    if (!user || !analyticsData || !username) return;
    
    setIsSaving(true);
    try {
      const profileData = {
        github_username: username,
        display_name: analyticsData.user?.name || null,
        avatar_url: analyticsData.user?.avatar_url || null,
        bio: analyticsData.user?.bio || null,
        public_repos: analyticsData.user?.public_repos || null,
        followers: analyticsData.user?.followers || null,
        following: analyticsData.user?.following || null,
        location: analyticsData.user?.location || null,
        company: analyticsData.user?.company || null,
        blog: analyticsData.user?.blog || null,
        twitter_username: null, // Not available in current API
        total_contributions: analyticsData.contributions?.totalContributions || null,
        current_streak: analyticsData.stats?.currentStreak || null,
        longest_streak: analyticsData.stats?.longestStreak || null,
        is_public: true,
      };

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="GitHub Activity Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold text-white">GitHub Activity</h1>
            </Link>
            <div className="flex items-center gap-4">
              {/* Action Buttons - Only show when data is available */}
              {analyticsData && (
                <>
                  {/* Save Profile Button - Only show for authenticated users */}
                  {user && (
                    <button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save profile to your collection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {isSaving ? 'Saving...' : showSaveSuccess ? 'Saved!' : 'Save'}
                    </button>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setShowShareSuccess(true);
                      setTimeout(() => setShowShareSuccess(false), 2000);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                    title="Copy current URL to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    {showShareSuccess ? 'Copied!' : 'Share'}
                  </button>
                  
                  {/* Visit Profile Button */}
                  <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                    title="Visit GitHub profile"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>Visit</span>
                  </a>
                  
                  {/* Export Dropdown */}
                  <ExportDropdown data={analyticsData} />
                </>
              )}
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
          <p className="text-gray-500 text-sm mb-4">
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
