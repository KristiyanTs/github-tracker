import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubAnalytics } from '@/lib/github-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  try {
    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token is missing from environment variables');
      return NextResponse.json(
        { error: 'GitHub token is required. Please set GITHUB_TOKEN environment variable.' },
        { status: 500 }
      );
    }
    
    // Log token availability (without exposing the actual token)
    console.log('GitHub token available:', !!process.env.GITHUB_TOKEN);
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format' },
        { status: 400 }
      );
    }

    const analytics = await fetchGitHubAnalytics(username);
    
    // Validate the analytics data before returning
    if (!analytics || !analytics.contributions || !analytics.stats) {
      console.error('Invalid analytics data structure:', analytics);
      return NextResponse.json(
        { error: 'Invalid data structure received from GitHub API' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error: unknown) {
    console.error('GitHub API Error:', error);
    
    if (error instanceof Error && 'status' in error) {
      const statusError = error as Error & { status?: number };
      
      if (statusError.status === 401) {
        return NextResponse.json(
          { error: 'GitHub token is invalid or expired. Please check your GITHUB_TOKEN.' },
          { status: 401 }
        );
      }
      
      if (statusError.status === 404) {
        return NextResponse.json(
          { error: `User '${username}' not found` },
          { status: 404 }
        );
      }
      
      if (statusError.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (statusError.status === 503) {
        return NextResponse.json(
          { error: statusError.message },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch GitHub data. The service may be unavailable.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
