'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GitHubAnalytics as GitHubAnalyticsType } from '@/types/github';
import ContributionHeatmap from './charts/ContributionHeatmap';
import ContributionLineChart from './charts/ContributionLineChart';
import LanguageChart from './charts/LanguageChart';
import StatsCard from './charts/StatsCard';
import ExportButton from './ExportButton';
import ExportDropdown from './ExportDropdown';
import { calculateActivityStats } from '@/lib/github-api';

interface GitHubAnalyticsProps {
  username: string;
}

type ChartType = 'heatmap' | 'line' | 'languages' | 'stats' | 'all';

export default function GitHubAnalytics({ username }: GitHubAnalyticsProps) {
  const [data, setData] = useState<GitHubAnalyticsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<ChartType>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Automatically fetch data when component mounts or username changes
  React.useEffect(() => {
    if (username) {
      fetchAnalytics();
    }
  }, [username]);

  // Refetch only contribution data when year changes
  React.useEffect(() => {
    if (username && data) {
      fetchContributionsOnly(selectedYear);
    }
  }, [selectedYear]);

  const fetchAnalytics = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/github/${encodeURIComponent(username.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      
      const analytics = await response.json();
      setData(analytics);
    } catch (err: unknown) {
      console.error('Analytics fetch error:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch GitHub analytics. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('GitHub token')) {
          errorMessage = 'GitHub authentication is required. Please check your configuration.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'GitHub user not found. Please check the username.';
        } else if (err.message.includes('unavailable')) {
          errorMessage = 'GitHub data is currently unavailable. Please try again later.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const fetchContributionsOnly = async (year: number) => {
    if (!username.trim()) return;
    
    try {
      const url = `/api/github/${encodeURIComponent(username.trim())}/contributions?year=${year}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contribution data');
      }
      
      const newContributions = await response.json();
      
      // Update only the contributions data, keeping everything else the same
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          contributions: newContributions,
          stats: calculateActivityStats(newContributions, year)
        };
      });
    } catch (err: unknown) {
      console.error('Contributions fetch error:', err);
      // Don't show error to user for year changes, just log it
    }
  };



  const chartButtons = [
    { id: 'all' as ChartType, label: 'All Charts', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ) },
    { id: 'heatmap' as ChartType, label: 'Heatmap', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) },
    { id: 'line' as ChartType, label: 'Timeline', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) },
    { id: 'languages' as ChartType, label: 'Languages', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ) },
    { id: 'stats' as ChartType, label: 'Stats', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ) },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
        <p className="text-gray-400">Fetching GitHub analytics...</p>
        <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
      </div>
    );
  }

  if (error) {
    // Check if this is a contribution data unavailable error
    const isContributionError = error.includes('contribution data is currently unavailable') || 
                               error.includes('GitHub token is required') ||
                               error.includes('API limitations');
    
    return (
      <div className={`${isContributionError ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-red-900/20 border-red-500/50'} border rounded-lg p-6 text-center`}>
        <div className={`${isContributionError ? 'text-yellow-400' : 'text-red-400'} mb-4`}>
          {isContributionError ? (
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        <h3 className={`text-xl font-bold ${isContributionError ? 'text-yellow-400' : 'text-red-400'} mb-2`}>
          {isContributionError ? 'Data Currently Unavailable' : 'Unable to fetch data'}
        </h3>
        <p className="text-gray-300 mb-4">{error}</p>
        {isContributionError && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 text-left">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">💡 To get real contribution data:</h4>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Create a GitHub Personal Access Token</li>
              <li>Add it to your <code className="bg-gray-700 px-1 rounded">.env.local</code> as <code className="bg-gray-700 px-1 rounded">GITHUB_TOKEN</code></li>
              <li>Restart your development server</li>
            </ol>
            <p className="text-xs text-gray-400 mt-2">See README.md for detailed setup instructions</p>
          </div>
        )}
        <button
          onClick={fetchAnalytics}
          className={`${isContributionError ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-2 rounded-lg transition-colors`}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ready to analyze</h3>
        <p className="text-gray-400">Click &quot;Analyze Activity&quot; to fetch GitHub data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-6">
          <Image
            src={data.user.avatar_url}
            alt={`${data.user.login}'s avatar`}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full border-4 border-green-400"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {data.user.name || data.user.login}
            </h2>
            <p className="text-green-400 font-medium">@{data.user.login}</p>
            {data.user.bio && (
              <p className="text-gray-300 mt-2">{data.user.bio}</p>
            )}
            <div className="flex gap-6 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 002-2h10a2 2 0 002 2v2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                </svg>
                {data.user.public_repos} repos
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {data.user.followers} followers
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Joined {new Date(data.user.created_at).getFullYear()}
              </span>
            </div>
          </div>
          <ExportDropdown data={data} />
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1">
          {chartButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setActiveChart(button.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                activeChart === button.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
              }`}
            >
              {button.icon} {button.label}
            </button>
          ))}
        </div>
        
        {/* Year Selector - only show for year-affected charts */}
        {(activeChart === 'all' || activeChart === 'heatmap' || activeChart === 'line' || activeChart === 'stats') && (
          <div className="flex items-center gap-2">
            <label htmlFor="year-selector" className="text-sm text-gray-400">Year:</label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="space-y-8">
        {/* Year-Affected Components Wrapper */}
        {(activeChart === 'all' || activeChart === 'heatmap' || activeChart === 'stats' || activeChart === 'line') && (
          <div className="space-y-12">
            {/* Contribution Heatmap */}
            {(activeChart === 'all' || activeChart === 'heatmap') && (
              <div className="py-4">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Contribution Heatmap</h3>
                    <p className="text-gray-400 text-sm">Your daily contribution activity visualization</p>
                  </div>
                  <ExportButton 
                    targetId="heatmap-chart" 
                    filename={`github-heatmap-${data.user.login}`}
                    minimal={true}
                    tooltip="Save heatmap image"
                  />
                </div>
                <div id="heatmap-chart">
                  <ContributionHeatmap 
                    data={data.contributions} 
                    onYearChange={handleYearChange}
                    availableYears={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)}
                    selectedYear={selectedYear}
                  />
                </div>
              </div>
            )}

            {/* Activity Statistics */}
            {(activeChart === 'all' || activeChart === 'stats') && (
              <div className="py-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Activity Statistics</h3>
                    <p className="text-gray-400 text-sm">Your GitHub activity metrics and patterns</p>
                  </div>
                  <ExportButton 
                    targetId="stats-chart" 
                    filename={`github-stats-${data.user.login}`}
                    minimal={true}
                    tooltip="Save stats as image"
                  />
                </div>
                <div id="stats-chart">
                  <StatsCard stats={data.stats} selectedYear={selectedYear} />
                </div>
              </div>
            )}

            {/* Contribution Timeline */}
            {(activeChart === 'all' || activeChart === 'line') && (
              <div className="py-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Contribution Timeline</h3>
                    <p className="text-gray-400 text-sm">Your activity patterns over time</p>
                  </div>
                  <ExportButton 
                    targetId="timeline-chart" 
                    filename={`github-timeline-${data.user.login}`}
                    minimal={true}
                    tooltip="Save timeline as image"
                  />
                </div>
                <div id="timeline-chart">
                  <ContributionLineChart data={data.contributions} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Languages Chart - Separate since it's not affected by year */}
        {(activeChart === 'all' || activeChart === 'languages') && (
          <div className="py-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Programming Languages</h3>
                <p className="text-gray-400 text-sm">Your most used languages and technologies</p>
              </div>
              <ExportButton 
                targetId="languages-chart" 
                filename={`github-languages-${data.user.login}`}
                minimal={true}
                tooltip="Save languages chart as image"
              />
            </div>
            <div id="languages-chart">
              <LanguageChart data={data.languages} type="pie" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-400 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>
            <strong>Pro tip:</strong> Export as JSON to create custom visualizations or 
            save charts as images for your CV by taking screenshots of individual sections.
          </span>
        </p>
      </div>
    </div>
  );
}
