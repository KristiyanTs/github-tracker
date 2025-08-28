import { NextRequest, NextResponse } from 'next/server';
import { fetchLanguageStats } from '@/lib/github-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  try {
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format' },
        { status: 400 }
      );
    }

    const languages = await fetchLanguageStats(username);
    
    return NextResponse.json({ languages }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    });
    
  } catch (error: unknown) {
    console.error('Language Stats Error:', error);
    
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
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch language statistics. The service may be unavailable.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
