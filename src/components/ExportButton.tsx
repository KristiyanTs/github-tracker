'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
  minimal?: boolean;
  tooltip?: string;
}

export default function ExportButton({ 
  targetId, 
  filename = 'github-chart', 
  className = '',
  children,
  minimal = false,
  tooltip = 'Export as image'
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const exportAsImage = async () => {
    setExporting(true);
    
    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error(`Element with id "${targetId}" not found`);
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827', // Match our dark theme
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        height: element.scrollHeight,
        width: element.scrollWidth,
        scrollX: 0,
        scrollY: 0,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const buttonContent = exporting ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      {!minimal && 'Exporting...'}
    </>
  ) : (
    children || (
      <>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {!minimal && 'Export as Image'}
      </>
    )
  );

  const baseClasses = minimal 
    ? 'inline-flex items-center justify-center p-2 rounded-lg transition-colors'
    : 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors';

  const colorClasses = exporting
    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
    : minimal 
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  const button = (
    <button
      onClick={exportAsImage}
      disabled={exporting}
      className={`${baseClasses} ${colorClasses} ${className}`}
      title={minimal ? tooltip : undefined}
    >
      {buttonContent}
    </button>
  );

  return button;
}
