'use client';

import React from 'react';
import { ContributionData, ContributionDay } from '@/types/github';

interface ContributionHeatmapProps {
  data: ContributionData;
  className?: string;
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
  selectedYear
}: ContributionHeatmapProps) {
  const { weeks } = data;
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Use selectedYear prop directly, fallback to current year
  const currentYear = selectedYear || new Date().getFullYear();
  
  // Extend weeks to cover the full year if we're looking at the current year
  const extendedWeeks = React.useMemo(() => {
    const currentDate = new Date();
    const isCurrentYear = currentYear === currentDate.getFullYear();
    
    if (!isCurrentYear) {
      return weeks; // Don't extend for past years
    }
    
    // Find the last date in the existing data
    const lastWeek = weeks[weeks.length - 1];
    if (!lastWeek || !lastWeek.contributionDays.length) {
      return weeks;
    }
    
    const lastDay = lastWeek.contributionDays[lastWeek.contributionDays.length - 1];
    const lastDate = new Date(lastDay.date);
    
    // Calculate end of year
    const endOfYear = new Date(currentYear, 11, 31); // December 31st
    
    // If we're already at or past the end of year, no need to extend
    if (lastDate >= endOfYear) {
      return weeks;
    }
    
    const extendedWeeksList = [...weeks];
    
    // Generate remaining weeks for the year
    // Start from the week after the last existing week
    const nextWeekStart = new Date(lastDate);
    nextWeekStart.setDate(nextWeekStart.getDate() + (7 - nextWeekStart.getDay())); // Move to next Sunday
    
    while (nextWeekStart <= endOfYear) {
      const contributionDays: ContributionDay[] = [];
      
      // Generate 7 days for this week
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(nextWeekStart);
        dayDate.setDate(nextWeekStart.getDate() + i);
        
        // Only add days within the current year and up to end of year
        if (dayDate.getFullYear() === currentYear && dayDate <= endOfYear) {
          contributionDays.push({
            date: dayDate.toISOString().split('T')[0],
            count: 0,
            level: 0
          });
        }
      }
      
      // Add the week if it has any days
      if (contributionDays.length > 0) {
        extendedWeeksList.push({
          contributionDays
        });
      }
      
      // Move to next week
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    }
    
    return extendedWeeksList;
  }, [weeks, currentYear]);


  // Get month labels for the top of the chart
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;
    
    extendedWeeks.forEach((week, weekIndex) => {
      const firstDay = week.contributionDays[0];
      if (firstDay) {
        const date = new Date(firstDay.date);
        const month = date.getMonth();
        
        // Only add month label if it's a new month and we're in the target year
        if (month !== currentMonth && date.getFullYear() === currentYear) {
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

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handleDayHover = (day: ContributionDay, event: React.MouseEvent) => {
    // Clear any pending hide timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    const tooltip = document.getElementById('contribution-tooltip');
    if (tooltip) {
      const date = new Date(day.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const isHidden = tooltip.style.display === 'none' || !tooltip.style.display || tooltip.style.opacity === '0';
      
      // Update content smoothly
      const contentDiv = tooltip.querySelector('div');
      if (contentDiv && !isHidden) {
        // If tooltip is visible, just update content with a subtle fade
        contentDiv.style.transition = 'opacity 100ms ease-out';
        contentDiv.style.opacity = '0.7';
        
        setTimeout(() => {
          tooltip.innerHTML = `
            <div class="bg-gray-900 text-white p-2 rounded shadow-lg border border-gray-700">
              <div class="font-medium">${day.count} contributions</div>
              <div class="text-sm text-gray-300">${formattedDate}</div>
            </div>
          `;
          const newContentDiv = tooltip.querySelector('div');
          if (newContentDiv) {
            newContentDiv.style.transition = 'opacity 100ms ease-out';
            newContentDiv.style.opacity = '1';
          }
        }, 50);
      } else {
        // First time showing or was hidden, do full content update
        tooltip.innerHTML = `
          <div class="bg-gray-900 text-white p-2 rounded shadow-lg border border-gray-700">
            <div class="font-medium">${day.count} contributions</div>
            <div class="text-sm text-gray-300">${formattedDate}</div>
          </div>
        `;
      }
      
      // Show tooltip if it's hidden
      if (isHidden) {
        tooltip.style.display = 'block';
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(8px) scale(0.9)';
        
        // Smooth fade in
        requestAnimationFrame(() => {
          tooltip.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'translateY(0) scale(1)';
        });
      }
      
      // Smooth position update
      tooltip.style.position = 'fixed';
      if (!isHidden) {
        tooltip.style.transition = 'left 150ms ease-out, top 150ms ease-out';
      }
      tooltip.style.left = `${event.clientX + 12}px`;
      tooltip.style.top = `${event.clientY - 8}px`;
      tooltip.style.zIndex = '9999';
      tooltip.style.pointerEvents = 'none';
    }
  };

  const handleDayLeave = () => {
    // Add a small delay before hiding to allow smooth transitions between adjacent days
    tooltipTimeoutRef.current = setTimeout(() => {
      const tooltip = document.getElementById('contribution-tooltip');
      if (tooltip) {
        tooltip.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out';
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(8px) scale(0.9)';
        
        // Hide after animation
        setTimeout(() => {
          if (tooltip.style.opacity === '0') {
            tooltip.style.display = 'none';
          }
        }, 150);
      }
    }, 100); // Small delay to allow moving between adjacent squares
  };

  return (
    <div className={`contribution-heatmap ${className}`}>
      {/* Tooltip */}
      <div
        id="contribution-tooltip"
        className="fixed pointer-events-none"
        style={{ 
          display: 'none',
          zIndex: 9999,
          position: 'fixed'
        }}
      />
      


      <div className="relative">
        {/* Month Labels */}
        <div className="flex mb-2 ml-8">
          {monthLabels.map(({ month, weekIndex }) => (
            <div
              key={`${month}-${weekIndex}`}
              className="text-xs text-gray-400 absolute"
              style={{ left: `${(weekIndex * 14) + 32}px` }}
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
                {index % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-1 mt-5">
            {extendedWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {/* Create array of 7 elements for each day of the week */}
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = week.contributionDays.find(d => {
                    const date = new Date(d.date);
                    return date.getDay() === dayIndex;
                  });
                  
                  return day ? (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-2.5 h-2.5 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: LEVEL_COLORS[day.level],
                        outline: day.count > 0 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                      }}
                      onMouseEnter={(e) => handleDayHover(day, e)}
                      onMouseLeave={handleDayLeave}
                    />
                  ) : (
                    <div
                      key={`${weekIndex}-${dayIndex}-empty`}
                      className="w-2.5 h-2.5"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 text-xs text-gray-400 gap-3">
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
