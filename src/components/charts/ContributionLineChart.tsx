'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ContributionData } from '@/types/github';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ContributionLineChartProps {
  data: ContributionData;
  className?: string;
}

export default function ContributionLineChart({ data, className = '' }: ContributionLineChartProps) {
  const currentDate = new Date();
  
  // Transform data for line chart (weekly aggregation) - only up to current date
  const chartData = data.weeks
    .map((week, index) => {
      const weekTotal = week.contributionDays.reduce((sum, day) => sum + day.count, 0);
      const firstDay = week.contributionDays[0];
      const date = new Date(firstDay.date);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        week: `Week ${index + 1}`,
        contributions: weekTotal,
        label: monthLabel,
        date: firstDay.date
      };
    })
    .filter(weekData => {
      const weekDate = new Date(weekData.date);
      return weekDate <= currentDate;
    });

  const chartConfig = {
    data: {
      labels: chartData.map(item => item.label),
      datasets: [{
        label: 'Contributions',
        data: chartData.map(item => item.contributions),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#059669',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#d1d5db',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: function(tooltipItems: any) {
              const dataIndex = tooltipItems[0].dataIndex;
              const weekData = chartData[dataIndex];
              return `Week starting ${weekData.label}`;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function(tooltipItem: any) {
              return `${tooltipItem.parsed.y} contributions`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(55, 65, 81, 0.3)',
            borderColor: '#374151',
          },
          ticks: {
            color: '#9ca3af',
            maxTicksLimit: 8,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function(value: any, index: number) {
              // Show every 4th label to avoid crowding
              return index % 4 === 0 ? chartData[index]?.label : '';
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(55, 65, 81, 0.3)',
            borderColor: '#374151',
          },
          ticks: {
            color: '#9ca3af',
            beginAtZero: true,
            padding: 10,
          },
          label: {
            display: true,
            text: 'Contributions',
            color: '#9ca3af',
            font: {
              size: 12
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      elements: {
        point: {
          hoverRadius: 6,
        }
      }
    }
  };

  return (
    <div className={`contribution-line-chart ${className}`}>
      <div className="h-80 w-full">
        <Line data={chartConfig.data} options={chartConfig.options} />
      </div>
    </div>
  );
}
