'use client';

import React, { useState, useEffect } from 'react';
import { GitHubEvent, RecentActivity as RecentActivityType } from '@/types/github';

interface RecentActivityProps {
  username: string;
}

interface ActivityItemProps {
  event: GitHubEvent;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ event }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'PushEvent':
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        );
      case 'WatchEvent':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'ForkEvent':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'CreateEvent':
        return (
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'IssuesEvent':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PullRequestEvent':
        return (
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'ReleaseEvent':
        return (
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getEventDescription = (event: GitHubEvent) => {
    const repoName = event.repo.name.split('/')[1];
    const timeAgo = getTimeAgo(event.created_at);

    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.commits?.length || 1;
        const commitMessage = event.payload.commits?.[0]?.message || 'No commit message';
        return {
          action: `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to`,
          repo: repoName,
          detail: commitMessage.length > 60 ? commitMessage.substring(0, 60) + '...' : commitMessage,
          time: timeAgo
        };
      
      case 'WatchEvent':
        return {
          action: 'Starred',
          repo: repoName,
          detail: null,
          time: timeAgo
        };
      
      case 'ForkEvent':
        return {
          action: 'Forked',
          repo: repoName,
          detail: null,
          time: timeAgo
        };
      
      case 'CreateEvent':
        const refType = event.payload.ref_type;
        return {
          action: `Created ${refType}`,
          repo: repoName,
          detail: event.payload.ref || null,
          time: timeAgo
        };
      
      case 'IssuesEvent':
        const issueAction = event.payload.action;
        const issueTitle = event.payload.issue?.title;
        return {
          action: `${issueAction} issue in`,
          repo: repoName,
          detail: issueTitle && issueTitle.length > 50 ? issueTitle.substring(0, 50) + '...' : issueTitle,
          time: timeAgo
        };
      
      case 'PullRequestEvent':
        const prAction = event.payload.action;
        const prTitle = event.payload.pull_request?.title;
        return {
          action: `${prAction} pull request in`,
          repo: repoName,
          detail: prTitle && prTitle.length > 50 ? prTitle.substring(0, 50) + '...' : prTitle,
          time: timeAgo
        };
      
      case 'ReleaseEvent':
        const releaseAction = event.payload.action;
        const releaseName = event.payload.release?.name || event.payload.release?.tag_name;
        return {
          action: `${releaseAction} release in`,
          repo: repoName,
          detail: releaseName,
          time: timeAgo
        };
      
      default:
        return {
          action: event.type.replace('Event', ''),
          repo: repoName,
          detail: null,
          time: timeAgo
        };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return eventDate.toLocaleDateString();
  };

  const description = getEventDescription(event);

  return (
    <div className="flex items-start gap-2 py-1.5 hover:bg-gray-700/10 transition-colors rounded px-2">
      <div className="mt-0.5">
        {getEventIcon(event.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-gray-300 text-sm">
            {description.action}
          </span>
          <a
            href={`https://github.com/${event.repo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
          >
            {description.repo}
          </a>
          <span className="text-gray-500 text-xs">{description.time}</span>
        </div>
        {description.detail && (
          <p className="text-gray-400 text-xs leading-relaxed">
            {description.detail}
          </p>
        )}
      </div>
    </div>
  );
};

export default function RecentActivity({ username }: RecentActivityProps) {
  const [activity, setActivity] = useState<RecentActivityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivity = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/github/${encodeURIComponent(username)}/activity?page=${page}&per_page=10`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activity');
      }
      
      const newActivity: RecentActivityType = await response.json();
      
      if (append && activity) {
        setActivity({
          events: [...activity.events, ...newActivity.events],
          hasMore: newActivity.hasMore
        });
      } else {
        setActivity(newActivity);
      }
    } catch (err: unknown) {
      console.error('Activity fetch error:', err);
      
      let errorMessage = 'Failed to fetch recent activity. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('GitHub token')) {
          errorMessage = 'GitHub authentication is required. Please check your configuration.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'GitHub user not found. Please check the username.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (activity && activity.hasMore) {
      const nextPage = Math.floor(activity.events.length / 10) + 1;
      fetchActivity(nextPage, true);
    }
  };

  useEffect(() => {
    if (username) {
      fetchActivity();
    }
  }, [username]);

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
          <p className="text-gray-400 text-sm">Latest GitHub activity and events</p>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
          <p className="text-gray-400 text-sm">Latest GitHub activity and events</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-center">
          <div className="text-red-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 className="text-red-400 font-semibold mb-2 text-sm">Activity Unavailable</h4>
          <p className="text-gray-300 text-xs mb-3">{error}</p>
          <button
            onClick={() => fetchActivity()}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!activity || activity.events.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
          <p className="text-gray-400 text-sm">Latest GitHub activity and events</p>
        </div>
        <div className="text-center py-6">
          <div className="text-gray-400 mb-3">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-white font-semibold mb-1 text-sm">No Recent Activity</h4>
          <p className="text-gray-400 text-xs">No public activity found for this user.</p>
        </div>
      </div>
    );
  }

  const displayedEvents = expanded ? activity.events : activity.events.slice(0, 10);
  const hasMoreToShow = !expanded && activity.events.length > 10;
  const canLoadMore = expanded && activity.hasMore;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
        <p className="text-gray-400 text-sm">Latest GitHub activity and events</p>
      </div>
      
      <div className="space-y-0.5">
        {displayedEvents.map((event) => (
          <ActivityItem key={event.id} event={event} />
        ))}
      </div>

      {(hasMoreToShow || canLoadMore) && (
        <div className="mt-4 text-center">
          {hasMoreToShow && (
            <button
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show More ({activity.events.length - 10} more items)
            </button>
          )}
          
          {canLoadMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-green-400 hover:text-green-300 disabled:text-gray-500 transition-colors text-sm font-medium ml-3"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Load More from GitHub
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
