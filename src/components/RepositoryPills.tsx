'use client';

import React from 'react';
import { Repository } from '@/types/github';

interface RepositoryPillsProps {
  repositories: Repository[];
  maxDisplay?: number;
}

export default function RepositoryPills({ repositories, maxDisplay = 9 }: RepositoryPillsProps) {
  const [showAll, setShowAll] = React.useState(false);
  
  // Sort repositories by stars, then by update date
  const sortedRepos = repositories
    .filter(repo => repo) // Only show valid repos
    .sort((a, b) => {
      // First sort by stars (descending)
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      // Then by update date (most recent first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, showAll ? repositories.length : maxDisplay);

  if (sortedRepos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 002-2h10a2 2 0 002 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Public Repositories</h3>
        <p className="text-sm text-gray-500">This user doesn&apos;t have any public repositories yet.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-500';
    
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'C++': 'bg-blue-600',
      'C': 'bg-gray-600',
      'C#': 'bg-purple-500',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-600',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'Swift': 'bg-orange-500',
      'Kotlin': 'bg-purple-600',
      'HTML': 'bg-orange-400',
      'CSS': 'bg-blue-400',
      'Vue': 'bg-green-400',
      'React': 'bg-blue-300',
      'Svelte': 'bg-red-400',
      'Shell': 'bg-gray-700',
      'Dockerfile': 'bg-blue-700',
    };
    
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedRepos.map((repo) => (
          <div
            key={repo.id}
            className="group relative bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 transition-all duration-200 rounded-lg p-2.5 w-full h-16 flex flex-col justify-between"
            style={{ borderRadius: '4px' }}
          >
            {/* Repository Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white text-sm truncate group-hover:text-green-400 transition-colors">
                {repo.name}
              </h3>
              
              {/* Language Badge */}
              {repo.language && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`}></div>
                  <span className="text-xs text-gray-400">{repo.language}</span>
                </div>
              )}
            </div>

            {/* Repository Stats */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                {/* Stars */}
                {repo.stargazers_count > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-yellow-400">{formatNumber(repo.stargazers_count)}</span>
                  </div>
                )}
                
                {/* Forks */}
                {repo.forks_count > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-blue-400">{formatNumber(repo.forks_count)}</span>
                  </div>
                )}
              </div>
              
              {/* Last updated */}
              <span className="text-xs">{formatDate(repo.updated_at)}</span>
            </div>

            {/* Repository Link Overlay */}
            <a
              href={`https://github.com/${repo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 rounded-lg"
              aria-label={`View ${repo.name} repository on GitHub`}
            />
          </div>
        ))}
      </div>
      
      {/* Show more/less toggle */}
      {repositories.length > maxDisplay && (
        <div className="text-center mt-3">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            {showAll ? 'Show Less' : `See More (${repositories.length - maxDisplay} more)`}
          </button>
        </div>
      )}
    </div>
  );
}
