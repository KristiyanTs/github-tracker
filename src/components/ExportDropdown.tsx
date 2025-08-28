'use client';

import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GitHubAnalytics } from '@/types/github';

interface ExportDropdownProps {
  data: GitHubAnalytics;
  className?: string;
}

export default function ExportDropdown({ data, className = '' }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<'json' | 'pdf' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const exportAsJSON = async () => {
    setExporting('json');
    setIsOpen(false);
    
    try {
      const exportData = {
        username: data.user.login,
        exported_at: new Date().toISOString(),
        analytics: data
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `github-analytics-${data.user.login}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Failed to export JSON. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const exportAsPDF = async () => {
    setExporting('pdf');
    setIsOpen(false);
    
    try {
      // Get all chart elements
      const chartElements = [
        'heatmap-chart',
        'stats-chart', 
        'timeline-chart',
        'languages-chart'
      ];

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title page
      pdf.setFontSize(24);
      pdf.setTextColor(34, 197, 94); // Green color
      pdf.text('GitHub Analytics Report', margin, margin + 20);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`@${data.user.login}`, margin, margin + 35);
      
      if (data.user.name) {
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.text(data.user.name, margin, margin + 45);
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, margin + 60);

      let yPosition = margin + 80;

      // Add user stats
      if (data.user && data.stats) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Profile Statistics:', margin, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        const stats = [
          `Public Repositories: ${data.user.public_repos}`,
          `Followers: ${data.user.followers}`,
          `Following: ${data.user.following}`,
          `Total Contributions: ${data.stats.totalContributions}`,
          `Current Streak: ${data.stats.currentStreak} days`,
          `Longest Streak: ${data.stats.longestStreak} days`,
          `Account Created: ${new Date(data.user.created_at).toLocaleDateString()}`
        ];
        
        stats.forEach(stat => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(stat, margin, yPosition);
          yPosition += 8;
        });
      }

      // Capture and add charts
      for (const chartId of chartElements) {
        const element = document.getElementById(chartId);
        if (!element) continue;

        try {
          const canvas = await html2canvas(element, {
            backgroundColor: '#111827',
            scale: 1,
            useCORS: true,
            allowTaint: true,
            height: element.scrollHeight,
            width: element.scrollWidth,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgAspectRatio = canvas.width / canvas.height;
          const imgWidth = contentWidth;
          const imgHeight = imgWidth / imgAspectRatio;

          // Add new page for each chart
          pdf.addPage();
          
          // Add chart title
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          const chartTitles: { [key: string]: string } = {
            'heatmap-chart': 'Contribution Heatmap',
            'stats-chart': 'Activity Statistics',
            'timeline-chart': 'Contribution Timeline',
            'languages-chart': 'Programming Languages'
          };
          pdf.text(chartTitles[chartId] || 'Chart', margin, margin + 10);
          
          // Add chart image
          pdf.addImage(imgData, 'PNG', margin, margin + 20, imgWidth, Math.min(imgHeight, pageHeight - margin - 30));
        } catch (chartError) {
          console.warn(`Failed to capture chart ${chartId}:`, chartError);
        }
      }

      // Save the PDF
      pdf.save(`github-analytics-${data.user.login}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting !== null}
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm ${
          exporting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Export data"
      >
        {exporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <a
              href={`https://github.com/${data.user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Visit Profile
            </a>
            
            <div className="border-t border-gray-700 my-2"></div>
            
            <button
              onClick={exportAsJSON}
              disabled={exporting !== null}
              className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as JSON
              {exporting === 'json' && (
                <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
            </button>
            
            <button
              onClick={exportAsPDF}
              disabled={exporting !== null}
              className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as PDF
              {exporting === 'pdf' && (
                <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
