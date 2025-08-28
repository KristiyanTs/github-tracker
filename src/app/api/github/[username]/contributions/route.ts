import { NextRequest, NextResponse } from 'next/server';
import { fetchContributions } from '@/lib/github-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  
  try {
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

    const contributions = await fetchContributions(username, year);
    
    return NextResponse.json(contributions, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error: unknown) {
    console.error('GitHub Contributions API Error:', error);
    
    if (error instanceof Error && 'status' in error) {
      const statusError = error as Error & { status?: number };
      
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
        error: 'Failed to fetch GitHub contributions. The service may be unavailable.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
