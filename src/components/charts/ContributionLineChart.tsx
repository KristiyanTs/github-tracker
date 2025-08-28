'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ContributionData } from '@/types/github';

interface ContributionLineChartProps {
  data: ContributionData;
  className?: string;
}

export default function ContributionLineChart({ data, className = '' }: ContributionLineChartProps) {
  // Transform data for line chart (weekly aggregation)
  const chartData = data.weeks.map((week, index) => {
    const weekTotal = week.contributionDays.reduce((sum, day) => sum + day.count, 0);
    const firstDay = week.contributionDays[0];
    const date = new Date(firstDay.date);
    const weekLabel = `Week ${index + 1}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return {
      week: weekLabel,
      contributions: weekTotal,
      label: monthLabel,
      date: firstDay.date
    };
  });

  interface TooltipPayload {
    payload: {
      week: string;
      contributions: number;
      label: string;
      date: string;
    };
    value: number;
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{`${payload[0].value} contributions`}</p>
          <p className="text-gray-300 text-sm">{`Week starting ${data.label}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`contribution-line-chart ${className}`}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              fontSize={12}
              interval="preserveStartEnd"
              tickFormatter={(value, index) => {
                // Show every 4th label to avoid crowding
                return index % 4 === 0 ? value : '';
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'Contributions', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="contributions"
              stroke="#10B981"
              strokeWidth={2}
              dot={{
                fill: '#10B981',
                strokeWidth: 2,
                r: 3
              }}
              activeDot={{
                r: 5,
                fill: '#059669',
                stroke: '#10B981',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
