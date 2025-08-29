'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/types/database';
import { useRouter } from 'next/navigation';

interface SavedProfilesProps {
  className?: string;
}

export default function SavedProfiles({ className = '' }: SavedProfilesProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfiles();
  }, []); // Remove user dependency - always fetch latest profiles

  // Refresh profiles when a new one might have been added
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProfiles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profiles/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (username: string) => {
    router.push(`/${encodeURIComponent(username)}`);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Recently Explored</h3>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Recently Explored</h3>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchProfiles}
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className={`${className}`}>
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Recently Explored</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">No profiles explored yet</p>
            <p className="text-gray-500 text-sm">
              Search GitHub profiles to see the latest explored profiles here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Recently Explored</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-green-500/30 transition-all group cursor-pointer"
              onClick={() => handleProfileClick(profile.github_username)}
            >
              <div className="flex items-center gap-3 mb-3">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.github_username}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate">
                    {profile.display_name || profile.github_username}
                  </h4>
                  <p className="text-gray-400 text-sm">@{profile.github_username}</p>
                </div>
              </div>
              
              {profile.bio && (
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{profile.bio}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  {profile.public_repos !== null && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {profile.public_repos}
                    </span>
                  )}
                  {profile.followers !== null && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {profile.followers}
                    </span>
                  )}
                </div>
                <span className="text-xs">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
