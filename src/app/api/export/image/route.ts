import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chartData, options } = await request.json();
    
    if (!chartData || !options) {
      return NextResponse.json(
        { error: 'Chart data and options are required' },
        { status: 400 }
      );
    }

    // For now, return the data structure for client-side processing
    // In a production environment, you might want to use a server-side
    // image generation library like Puppeteer or Playwright
    
    return NextResponse.json({
      success: true,
      message: 'Use client-side html2canvas for image generation',
      data: chartData,
      options
    });
    
  } catch (error: unknown) {
    console.error('Export API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process export request',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
