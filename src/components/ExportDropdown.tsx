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
