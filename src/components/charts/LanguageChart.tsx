'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie, Bar } from 'react-chartjs-2';
import { LanguageStats } from '@/types/github';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

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

export default function LanguageChart({ data, type = 'pie', className = '' }: LanguageChartProps) {
  // Transform data for charts
  const totalSize = Object.values(data).reduce((sum, size) => sum + size, 0);
  
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) // Show top 8 languages for better pie chart readability
    .map(([language, size]) => ({
      language,
      size,
      percentage: ((size / totalSize) * 100).toFixed(1),
      color: LANGUAGE_COLORS[language] || LANGUAGE_COLORS.Default
    }));

  if (chartData.length === 0) {
    return (
      <div className={`language-chart ${className}`}>
        <div className="h-80 w-full flex items-center justify-center">
          <p className="text-gray-500">No language statistics found</p>
        </div>
      </div>
    );
  }

  // Chart.js configuration
  const chartConfig = {
    data: {
      labels: chartData.map(item => item.language),
      datasets: [{
        data: chartData.map(item => item.size),
        backgroundColor: chartData.map(item => item.color),
        borderColor: chartData.map(item => item.color),
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverOffset: 10,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We'll create a custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#d1d5db',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function(tooltipItem: any) {
              const label = tooltipItem.label || '';
              const value = tooltipItem.parsed;
              const percentage = ((value / totalSize) * 100).toFixed(1);
              return `${label}: ${percentage}% (${value.toLocaleString()} bytes)`;
            }
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold' as const,
            size: 11
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function(value: any, context: any) {
            const percentage = (value / totalSize) * 100;
            // Only show labels for segments that are large enough to fit text
            return percentage > 8 ? context.chart.data.labels[context.dataIndex] : '';
          },
          textAlign: 'center' as const,
          textBaseline: 'middle' as const
        }
      },
      elements: {
        arc: {
          borderWidth: 0,
        }
      }
    }
  };

  // Bar chart configuration
  const barConfig = {
    data: {
      labels: chartData.map(item => item.language),
      datasets: [{
        data: chartData.map(item => item.size),
        backgroundColor: chartData.map(item => item.color),
        borderColor: chartData.map(item => item.color),
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
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
            displayColors: true,
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: function(tooltipItem: any) {
                const label = tooltipItem.label || '';
                const value = tooltipItem.parsed;
                const percentage = ((value / totalSize) * 100).toFixed(1);
                return `${label}: ${percentage}% (${value.toLocaleString()} bytes)`;
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function(value: any) {
              return `${(value / 1000).toFixed(0)}K`;
            }
          }
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#9ca3af',
          }
        }
      }
    }
  };

  return (
    <div className={`language-chart ${className}`}>
      <div className="h-80 w-full">
        {type === 'bar' ? (
          <Bar data={barConfig.data} options={barConfig.options} />
        ) : (
          <Pie data={chartConfig.data} options={chartConfig.options} />
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {chartData.map((lang) => (
          <div key={lang.language} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-600/50 hover:border-gray-500/70 transition-colors duration-200">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-xs font-medium text-gray-200">
              {lang.language}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
