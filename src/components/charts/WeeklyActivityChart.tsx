'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { ContributionData } from '@/types/github';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface WeeklyActivityChartProps {
  data: ContributionData;
  className?: string;
}

export default function WeeklyActivityChart({ data, className = '' }: WeeklyActivityChartProps) {
  // Calculate average commits per day of week
  const dayStats = {
    Sunday: { total: 0, count: 0 },
    Monday: { total: 0, count: 0 },
    Tuesday: { total: 0, count: 0 },
    Wednesday: { total: 0, count: 0 },
    Thursday: { total: 0, count: 0 },
    Friday: { total: 0, count: 0 },
    Saturday: { total: 0, count: 0 }
  };

  // Process contribution data to calculate day-of-week statistics
  data.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (dayStats[dayName as keyof typeof dayStats]) {
        dayStats[dayName as keyof typeof dayStats].total += day.count;
        dayStats[dayName as keyof typeof dayStats].count += 1;
      }
    });
  });

  // Calculate averages and prepare chart data
  const chartData = Object.entries(dayStats).map(([day, stats]) => ({
    day,
    average: stats.count > 0 ? stats.total / stats.count : 0,
    abbreviation: day.substring(0, 3) // Mon, Tue, etc.
  }));

  // Sort by day of week (Monday = 1, Tuesday = 2, etc.)
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedChartData = dayOrder.map(day => 
    chartData.find(item => item.day === day) || { day, average: 0, abbreviation: day.substring(0, 3) }
  );

  // Find most and least active days
  const mostActiveDay = sortedChartData.reduce((max, current) => 
    current.average > max.average ? current : max
  );
  const leastActiveDay = sortedChartData.reduce((min, current) => 
    current.average < min.average ? current : min
  );

  // Simple, consistent colors
  const colors = sortedChartData.map(() => '#10B981');
  const hoverColors = sortedChartData.map(() => '#059669');

  const chartConfig = {
    data: {
      labels: sortedChartData.map(item => item.day),
      datasets: [{
        label: 'Average Commits',
        data: sortedChartData.map(item => parseFloat(item.average.toFixed(2))),
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 'flex' as const,
        maxBarThickness: 20,
      }]
    },
    options: {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold' as const,
            size: 11
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function(value: any) {
            return value.toFixed(2);
          },
          textAlign: 'center' as const,
          textBaseline: 'middle' as const
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: function(tooltipItems: any) {
              const dataIndex = tooltipItems[0].dataIndex;
              const dayData = sortedChartData[dataIndex];
              return dayData.day;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function(tooltipItem: any) {
              const value = tooltipItem.parsed.x;
              return `${value.toFixed(2)} avg commits per day`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(55, 65, 81, 0.2)',
          },
          ticks: {
            color: '#6b7280',
            padding: 8,
            font: {
              size: 11
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function(value: any) {
              return value.toFixed(1);
            }
          }
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart' as const,
      },
      elements: {
        bar: {
          borderWidth: 0,
        }
      }
    }
  };

  // Check if there's any data
  const hasData = sortedChartData.some(d => d.average > 0);

  if (!hasData) {
    return (
      <div className={`weekly-activity-chart ${className}`}>
        <div className="h-80 w-full flex items-center justify-center">
          <p className="text-gray-500">No weekly activity data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`weekly-activity-chart ${className}`}>
      <div className="h-80 w-full">
        <Bar data={chartConfig.data} options={chartConfig.options} />
      </div>

      {/* Activity Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Most Active</p>
          <p className="text-base font-medium text-white">{mostActiveDay.day}</p>
          <p className="text-xs text-green-400 font-mono">{mostActiveDay.average.toFixed(2)}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Least Active</p>
          <p className="text-base font-medium text-white">{leastActiveDay.day}</p>
          <p className="text-xs text-blue-400 font-mono">{leastActiveDay.average.toFixed(2)}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Pattern</p>
          <p className="text-base font-medium text-white">
            {(() => {
              const weekdayAvg = sortedChartData.slice(0, 5).reduce((sum, d) => sum + d.average, 0) / 5;
              const weekendAvg = (sortedChartData[5].average + sortedChartData[6].average) / 2;
              return weekdayAvg > weekendAvg ? 'Weekday' : 'Weekend';
            })()}
          </p>
          <p className="text-xs text-purple-400 font-mono">
            {(() => {
              const weekdayAvg = sortedChartData.slice(0, 5).reduce((sum, d) => sum + d.average, 0) / 5;
              const weekendAvg = (sortedChartData[5].average + sortedChartData[6].average) / 2;
              const ratio = weekdayAvg > 0 && weekendAvg > 0 ? (weekdayAvg / weekendAvg).toFixed(1) : 'N/A';
              return `${ratio}x`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
