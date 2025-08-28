'use client';

import React from 'react';
import { ActivityStats } from '@/types/github';

interface StatsCardProps {
  stats: ActivityStats;
  className?: string;
}

interface StatItemProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

function StatItem({ title, value, subtitle, icon }: StatItemProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500/50 transition-colors">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-green-400 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-white truncate">{title}</h4>
          <p className="text-2xl font-extrabold text-green-400 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatsCard({ stats, className = '' }: StatsCardProps) {
  const formatStreak = (days: number) => {
    if (days === 0) return '0 days';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const formatAverage = (avg: number) => {
    return avg < 1 ? avg.toFixed(2) : avg.toFixed(1);
  };

  // Icons for different stats
  const FireIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
  );

  const ChartIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );

  const TrendingIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={`stats-card ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Activity Statistics</h3>
        <p className="text-gray-400 text-sm">Your GitHub activity metrics and patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatItem
          title="Current Streak"
          value={formatStreak(stats.currentStreak)}
          subtitle="Keep the momentum going!"
          icon={<FireIcon />}
        />
        
        <StatItem
          title="Longest Streak"
          value={formatStreak(stats.longestStreak)}
          subtitle="Your personal record"
          icon={<TrendingIcon />}
        />
        
        <StatItem
          title="Total Contributions"
          value={stats.totalContributions.toLocaleString()}
          subtitle="In the last year"
          icon={<ChartIcon />}
        />
        
        <StatItem
          title="Daily Average"
          value={formatAverage(stats.averagePerDay)}
          subtitle="Contributions per day"
          icon={<CalendarIcon />}
        />
        
        <StatItem
          title="Most Active Day"
          value={stats.mostActiveDay}
          subtitle="When you code the most"
          icon={<CalendarIcon />}
        />
        
        <StatItem
          title="Peak Month"
          value={stats.mostActiveMonth}
          subtitle="Your most productive month"
          icon={<CalendarIcon />}
        />
      </div>

      {/* Additional insights */}
      <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Quick Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Consistency Score:</span>{' '}
            <span className="text-green-400 font-medium">
              {stats.averagePerDay > 1 ? 'High' : stats.averagePerDay > 0.5 ? 'Medium' : 'Building'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Activity Level:</span>{' '}
            <span className="text-green-400 font-medium">
              {stats.totalContributions > 1000 ? 'Very Active' : 
               stats.totalContributions > 500 ? 'Active' : 
               stats.totalContributions > 100 ? 'Regular' : 'Getting Started'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
