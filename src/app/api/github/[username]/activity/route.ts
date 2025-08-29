import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentActivity } from '@/lib/github-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    // Validate parameters
    if (page < 1 || page > 10) {
      return NextResponse.json(
        { error: 'Page must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (perPage < 1 || perPage > 30) {
      return NextResponse.json(
        { error: 'Per page must be between 1 and 30' },
        { status: 400 }
      );
    }

    const activityData = await fetchRecentActivity(username, page, perPage);
    
    return NextResponse.json(activityData);
  } catch (error: unknown) {
    console.error('Recent activity API error:', error);
    
    if (error instanceof Error) {
      // Check for specific GitHub API errors
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: `GitHub user '${(await params).username}' not found` },
          { status: 404 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('GitHub token')) {
        return NextResponse.json(
          { error: 'GitHub authentication is required. Please check server configuration.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch recent activity data' },
      { status: 500 }
    );
  }
}
