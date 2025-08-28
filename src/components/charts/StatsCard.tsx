'use client';

import React from 'react';
import { ActivityStats } from '@/types/github';

interface StatsCardProps {
  stats: ActivityStats;
  className?: string;
  selectedYear?: number;
}

interface StatItemProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function StatItem({ title, value, subtitle, icon, disabled = false }: StatItemProps) {
  return (
    <div className={`border border-gray-700/50 rounded-lg p-4 transition-colors ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:border-green-500/50'
    }`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`flex-shrink-0 ${disabled ? 'text-gray-500' : 'text-green-400'}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`text-lg font-bold truncate ${disabled ? 'text-gray-500' : 'text-white'}`}>{title}</h4>
          <p className={`text-lg font-semibold mt-1 ${disabled ? 'text-gray-500' : 'text-green-400'}`}>{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-400'}`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatsCard({ stats, className = '', selectedYear }: StatsCardProps) {
  // Validate stats data
  if (!stats) {
    return (
      <div className={`stats-card ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">No statistics data available</p>
        </div>
      </div>
    );
  }
  
  const formatStreak = (days: number) => {
    if (days === 0) return '0 days';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const formatAverage = (avg: number) => {
    if (isNaN(avg) || !isFinite(avg)) return '0.0';
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

  // Validate and sanitize stats values
  const safeStats = {
    currentStreak: Math.max(0, Math.min(stats.currentStreak || 0, 1000)),
    longestStreak: Math.max(0, Math.min(stats.longestStreak || 0, 1000)),
    totalContributions: Math.max(0, Math.min(stats.totalContributions || 0, 100000)),
    averagePerDay: Math.max(0, Math.min(stats.averagePerDay || 0, 1000)),
    mostActiveDay: stats.mostActiveDay || 'Unknown',
    mostActiveMonth: stats.mostActiveMonth || 'Unknown'
  };
  
  // Calculate additional insights
  const consistencyScore = safeStats.averagePerDay > 1 ? 'High' : safeStats.averagePerDay > 0.5 ? 'Medium' : 'Building';
  const activityLevel = safeStats.totalContributions > 1000 ? 'Very Active' : 
                       safeStats.totalContributions > 500 ? 'Active' : 
                       safeStats.totalContributions > 100 ? 'Regular' : 'Getting Started';
  const streakEfficiency = safeStats.currentStreak > 0 && safeStats.longestStreak > 0 ? 
    Math.round((safeStats.currentStreak / safeStats.longestStreak) * 100) : 0;
  const weeklyAverage = (safeStats.averagePerDay * 7).toFixed(1);
  const monthlyAverage = (safeStats.averagePerDay * 30).toFixed(1);
  
  // Determine if we should show current streak or historical streak info
  const currentYear = new Date().getFullYear();
  const isCurrentYear = !selectedYear || selectedYear === currentYear;
  const showCurrentStreak = isCurrentYear && safeStats.currentStreak > 0;

  return (
    <div className={`stats-card ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatItem
          title="Current Streak"
          value={showCurrentStreak ? formatStreak(safeStats.currentStreak) : "N/A"}
          subtitle={showCurrentStreak ? "Keep the momentum going!" : "Not available for historical years"}
          icon={<FireIcon />}
          disabled={!showCurrentStreak}
        />
        
        <StatItem
          title="Longest Streak"
          value={formatStreak(safeStats.longestStreak)}
          subtitle="Your personal record"
          icon={<TrendingIcon />}
        />
        
        <StatItem
          title="Total Contributions"
          value={safeStats.totalContributions.toLocaleString()}
          subtitle={isCurrentYear ? "In the last year" : `In ${selectedYear || currentYear}`}
          icon={<ChartIcon />}
        />
        
        <StatItem
          title="Daily Average"
          value={formatAverage(safeStats.averagePerDay)}
          subtitle="Contributions per day"
          icon={<CalendarIcon />}
        />
        
        <StatItem
          title="Most Active Day"
          value={safeStats.mostActiveDay}
          subtitle="When you code the most"
          icon={<CalendarIcon />}
        />
        
        <StatItem
          title="Peak Month"
          value={safeStats.mostActiveMonth}
          subtitle="Your most productive month"
          icon={<CalendarIcon />}
        />
      </div>

      {/* Quick Insights */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Quick Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="group relative flex justify-between items-center py-2 cursor-help">
            <span className="text-gray-400">Consistency:</span>
            <span className="text-green-400 font-medium">{consistencyScore}</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
              Based on daily average: {formatAverage(safeStats.averagePerDay)} contributions/day
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="group relative flex justify-between items-center py-2 cursor-help">
            <span className="text-gray-400">Activity Level:</span>
            <span className="text-blue-400 font-medium">{activityLevel}</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
              Based on total contributions: {safeStats.totalContributions.toLocaleString()} in the period
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="group relative flex justify-between items-center py-2 cursor-help">
            <span className="text-gray-400">Streak Power:</span>
            <span className="text-purple-400 font-medium">{streakEfficiency}%</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
              Current streak ({safeStats.currentStreak} days) vs longest streak ({safeStats.longestStreak} days)
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="group relative flex justify-between items-center py-2 cursor-help">
            <span className="text-gray-400">Weekly Avg:</span>
            <span className="text-yellow-400 font-medium">{weeklyAverage}</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
              Daily average × 7: {formatAverage(safeStats.averagePerDay)} × 7 = {weeklyAverage}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="group relative flex justify-between items-center py-2 cursor-help">
            <span className="text-gray-400">Monthly Avg:</span>
            <span className="text-orange-400 font-medium">{monthlyAverage}</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
              Daily average × 30: {formatAverage(safeStats.averagePerDay)} × 30 = {monthlyAverage}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="group relative flex justify-between items-center py-2 cursor-help">
            <span className="text-gray-400">Goal Status:</span>
            <span className="text-red-400 font-medium">
              {safeStats.totalContributions >= 365 ? '365+ Days!' : 
               safeStats.totalContributions >= 100 ? '100+ Club!' : 
               safeStats.totalContributions >= 50 ? '50+ Milestone!' : 
               'Getting Started!'}
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
              {safeStats.totalContributions >= 365 ? 'Achieved 365+ contributions! Daily average goal met.' : 
               safeStats.totalContributions >= 100 ? '100+ contributions milestone reached!' : 
               safeStats.totalContributions >= 50 ? '50+ contributions milestone reached!' : 
               'Keep contributing to reach your first milestone!'}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
