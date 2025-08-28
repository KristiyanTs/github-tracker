'use client';

import React, { useState, useEffect } from 'react';
import { ContributionData, ContributionDay } from '@/types/github';
import ExportButton from '../ExportButton';

interface ContributionHeatmapProps {
  data: ContributionData;
  className?: string;
  onYearChange?: (year: number) => void;
  availableYears?: number[];
  selectedYear?: number;
}

const LEVEL_COLORS = {
  0: '#161b22', // No contributions
  1: '#0e4429', // Low
  2: '#006d32', // Medium-low
  3: '#26a641', // Medium-high
  4: '#39d353', // High
} as const;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContributionHeatmap({ 
  data, 
  className = '', 
  onYearChange,
  availableYears = [],
  selectedYear
}: ContributionHeatmapProps) {
  const { weeks } = data;
  const [currentYear, setCurrentYear] = useState(selectedYear || new Date().getFullYear());
  
  // Generate available years if not provided (last 5 years)
  const years = availableYears.length > 0 ? availableYears : (() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  })();

  useEffect(() => {
    if (selectedYear && selectedYear !== currentYear) {
      setCurrentYear(selectedYear);
    }
  }, [selectedYear]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value);
    setCurrentYear(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  // Get month labels for the top of the chart
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = week.contributionDays[0];
      if (firstDay) {
        const date = new Date(firstDay.date);
        const month = date.getMonth();
        
        if (month !== currentMonth && weekIndex % 4 === 0) {
          currentMonth = month;
          labels.push({
            month: MONTHS[month],
            weekIndex
          });
        }
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();

  const handleDayHover = (day: ContributionDay, event: React.MouseEvent) => {
    // Create tooltip
    const tooltip = document.getElementById('contribution-tooltip');
    if (tooltip) {
      const date = new Date(day.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      tooltip.innerHTML = `
        <div class="bg-gray-900 text-white p-2 rounded shadow-lg border border-gray-700">
          <div class="font-medium">${day.count} contributions</div>
          <div class="text-sm text-gray-300">${formattedDate}</div>
        </div>
      `;
      
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY - 10}px`;
    }
  };

  const handleDayLeave = () => {
    const tooltip = document.getElementById('contribution-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };

  return (
    <div className={`contribution-heatmap ${className}`}>
      {/* Tooltip */}
      <div
        id="contribution-tooltip"
        className="fixed pointer-events-none z-50"
        style={{ display: 'none' }}
      />
      
      {/* Chart Header with Title, Year Selector, and Export Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-white">
            {data.totalContributions.toLocaleString()} contributions in {currentYear}
          </h3>
          
          {/* Year Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="year-selector" className="text-sm text-gray-400">
              Year:
            </label>
            <select
              id="year-selector"
              value={currentYear}
              onChange={handleYearChange}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Export Button */}
        <ExportButton 
          targetId="heatmap-chart" 
          filename={`github-heatmap-${data.user?.login || 'user'}`}
          minimal={true}
          tooltip="Save heatmap image"
        />
      </div>

      <div className="relative">
        {/* Month Labels */}
        <div className="flex mb-2 ml-8">
          {monthLabels.map(({ month, weekIndex }) => (
            <div
              key={`${month}-${weekIndex}`}
              className="text-xs text-gray-400 absolute"
              style={{ left: `${weekIndex * 12}px` }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day Labels */}
          <div className="flex flex-col mr-2 mt-4">
            {DAYS.map((day, index) => (
              <div
                key={day}
                className="h-3 flex items-center text-xs text-gray-400"
                style={{ marginBottom: '2px' }}
              >
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.contributionDays.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-2.5 h-2.5 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: LEVEL_COLORS[day.level],
                      outline: day.count > 0 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => handleDayHover(day, e)}
                    onMouseLeave={handleDayLeave}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {Object.entries(LEVEL_COLORS).map(([level, color]) => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
