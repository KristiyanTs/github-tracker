'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LanguageStats } from '@/types/github';

interface LanguageChartProps {
  data: LanguageStats;
  type?: 'bar' | 'pie';
  className?: string;
}

const LANGUAGE_COLORS: { [key: string]: string } = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3776ab',
  Java: '#ed8b00',
  'C++': '#00599c',
  C: '#a8b9cc',
  'C#': '#239120',
  PHP: '#777bb4',
  Ruby: '#cc342d',
  Go: '#00add8',
  Rust: '#000000',
  Swift: '#fa7343',
  Kotlin: '#7f52ff',
  Dart: '#0175c2',
  HTML: '#e34f26',
  CSS: '#1572b6',
  Shell: '#89e051',
  Vue: '#4fc08d',
  React: '#61dafb',
  Angular: '#dd0031',
  Default: '#6b7280'
};

export default function LanguageChart({ data, type = 'bar', className = '' }: LanguageChartProps) {
  // Transform data for charts
  const totalSize = Object.values(data).reduce((sum, size) => sum + size, 0);
  
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Show top 10 languages
    .map(([language, size]) => ({
      language,
      size,
      percentage: ((size / totalSize) * 100).toFixed(1),
      color: LANGUAGE_COLORS[language] || LANGUAGE_COLORS.Default
    }));

  if (chartData.length === 0) {
    return (
      <div className={`language-chart ${className}`}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">Programming Languages</h3>
          <p className="text-gray-400 text-sm">No language data available</p>
        </div>
        <div className="h-80 w-full flex items-center justify-center">
          <p className="text-gray-500">No language statistics found</p>
        </div>
      </div>
    );
  }

  interface TooltipPayload {
    payload: {
      language: string;
      size: number;
      percentage: string;
      color: string;
    };
    value: number;
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{data.language}</p>
          <p className="text-gray-300 text-sm">{`${data.percentage}% (${data.size.toLocaleString()} bytes)`}</p>
        </div>
      );
    }
    return null;
  };



  return (
    <div className={`language-chart ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Programming Languages</h3>
        <p className="text-gray-400 text-sm">
          {type === 'bar' ? 'Repository language breakdown by code size' : 'Language distribution'}
        </p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <YAxis
                type="category"
                dataKey="language"
                stroke="#9CA3AF"
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="size"
                radius={[0, 4, 4, 0]}
                fill="#10B981"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="size"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {chartData.slice(0, 6).map((lang) => (
          <div key={lang.language} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-sm text-gray-300 truncate">
              {lang.language} ({lang.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
