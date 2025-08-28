import { GitHubUser, Repository, LanguageStats, ContributionData, ActivityStats, GitHubAnalytics } from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';

class GitHubAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

function getAuthHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Activity-Tracker',
    ...(token && { 'Authorization': `token ${token}` })
  };
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new GitHubAPIError(`User '${username}' not found`, 404);
    }
    if (response.status === 403) {
      throw new GitHubAPIError('API rate limit exceeded. Please try again later.', 403);
    }
    throw new GitHubAPIError(`Failed to fetch user data: ${response.statusText}`, response.status);
  }

  return response.json();
}

export async function fetchUserRepositories(username: string): Promise<Repository[]> {
  const repositories: Repository[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new GitHubAPIError('API rate limit exceeded. Please try again later.', 403);
      }
      throw new GitHubAPIError(`Failed to fetch repositories: ${response.statusText}`, response.status);
    }

    const pageRepos: Repository[] = await response.json();
    repositories.push(...pageRepos);

    if (pageRepos.length < perPage) {
      break;
    }
    page++;
  }

  return repositories;
}

export async function fetchLanguageStats(username: string): Promise<LanguageStats> {
  const repositories = await fetchUserRepositories(username);
  const languageStats: LanguageStats = {};
  
  for (const repo of repositories) {
    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.size;
    }
  }

  return languageStats;
}

// Generate contribution data from GitHub's contribution graph
// Note: This is a simplified version. For real contribution data, you'd need to scrape
// GitHub's contribution graph or use their GraphQL API
export async function fetchContributions(username: string): Promise<ContributionData> {
  const user = await fetchGitHubUser(username);
  
  // This is a mock implementation since GitHub's REST API doesn't provide contribution data
  // In a real implementation, you'd use GitHub's GraphQL API or scrape the contributions page
  const weeks = generateMockContributions();
  const totalContributions = weeks.reduce((total, week) => 
    total + week.contributionDays.reduce((weekTotal, day) => weekTotal + day.count, 0), 0
  );

  return {
    user,
    weeks,
    totalContributions
  };
}

function generateMockContributions() {
  const weeks = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  for (let week = 0; week < 53; week++) {
    const contributionDays = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (week * 7) + day);
      
      // Generate random contribution count with realistic patterns
      const isWeekend = day === 0 || day === 6;
      const baseChance = isWeekend ? 0.3 : 0.7;
      const hasContribution = Math.random() < baseChance;
      const count = hasContribution ? Math.floor(Math.random() * 15) + 1 : 0;
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0) {
        if (count <= 3) level = 1;
        else if (count <= 6) level = 2;
        else if (count <= 10) level = 3;
        else level = 4;
      }

      contributionDays.push({
        date: date.toISOString().split('T')[0],
        count,
        level
      });
    }
    weeks.push({ contributionDays });
  }
  
  return weeks;
}

export function calculateActivityStats(contributionData: ContributionData): ActivityStats {
  const allDays = contributionData.weeks.flatMap(week => week.contributionDays);
  const totalContributions = allDays.reduce((sum, day) => sum + day.count, 0);
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Start from most recent day
  const sortedDays = [...allDays].reverse();
  
  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    if (day.count > 0) {
      tempStreak++;
      if (i < 7) currentStreak++; // Only count recent days for current streak
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      if (i < 7) currentStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Find most active day and month
  const dayStats: { [key: string]: number } = {};
  const monthStats: { [key: string]: number } = {};
  
  allDays.forEach(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    
    dayStats[dayName] = (dayStats[dayName] || 0) + day.count;
    monthStats[monthName] = (monthStats[monthName] || 0) + day.count;
  });
  
  const mostActiveDay = Object.keys(dayStats).reduce((a, b) => 
    dayStats[a] > dayStats[b] ? a : b
  );
  
  const mostActiveMonth = Object.keys(monthStats).reduce((a, b) => 
    monthStats[a] > monthStats[b] ? a : b
  );
  
  return {
    longestStreak,
    currentStreak,
    totalContributions,
    averagePerDay: totalContributions / allDays.length,
    mostActiveDay,
    mostActiveMonth,
    contributionsLastYear: totalContributions
  };
}

export async function fetchGitHubAnalytics(username: string): Promise<GitHubAnalytics> {
  try {
    const [contributions, repositories, languages] = await Promise.all([
      fetchContributions(username),
      fetchUserRepositories(username),
      fetchLanguageStats(username)
    ]);

    const stats = calculateActivityStats(contributions);

    return {
      user: contributions.user,
      contributions,
      repositories,
      languages,
      stats
    };
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    throw new GitHubAPIError('Failed to fetch GitHub analytics');
  }
}
