import { GitHubUser, Repository, LanguageStats, ContributionData, ActivityStats, GitHubAnalytics, ContributionWeek } from '@/types/github';

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
  
  // Fetch detailed language stats for each repository (up to top 20 most recent)
  const topRepos = repositories
    .filter(repo => !repo.full_name.includes('.github.io') && !repo.language?.toLowerCase().includes('html')) // Filter out likely documentation repos
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 20); // Limit to avoid rate limits
  
  const languagePromises = topRepos.map(async (repo) => {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${repo.full_name}/languages`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const repoLanguages = await response.json();
        return { repo: repo.name, languages: repoLanguages };
      }
    } catch (error) {
      console.warn(`Failed to fetch languages for ${repo.full_name}:`, error);
    }
    
    // Fallback to basic repository language if API call fails
    return repo.language ? { repo: repo.name, languages: { [repo.language]: repo.size } } : null;
  });

  const results = await Promise.all(languagePromises);
  
  // Aggregate language stats across all repositories
  for (const result of results) {
    if (result?.languages) {
      for (const [language, bytes] of Object.entries(result.languages)) {
        if (typeof bytes === 'number') {
          languageStats[language] = (languageStats[language] || 0) + bytes;
        }
      }
    }
  }

  return languageStats;
}

// Fetch real contribution data from GitHub's GraphQL API
export async function fetchContributions(username: string, year?: number): Promise<ContributionData> {
  const user = await fetchGitHubUser(username);
  
  try {
    const contributions = await fetchRealContributions(username, year);
    return {
      user,
      ...contributions
    };
  } catch (error) {
    console.error('Failed to fetch real contribution data:', error);
    
    // Following user preference: don't use fake data, show that data is unavailable
    throw new GitHubAPIError(
      'GitHub contribution data is currently unavailable. This may be due to API limitations or missing authentication.',
      503
    );
  }
}

// GitHub GraphQL API types
interface GitHubContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
}

interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
}


// Fetch real contribution data using GitHub's GraphQL API
async function fetchRealContributions(username: string, year?: number): Promise<{ weeks: ContributionWeek[], totalContributions: number }> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new GitHubAPIError('GitHub token is required for contribution data. Please set GITHUB_TOKEN environment variable.');
  }

  const targetYear = year || new Date().getFullYear();
  const fromDate = `${targetYear}-01-01T00:00:00Z`;
  const toDate = `${targetYear}-12-31T23:59:59Z`;

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    username,
    from: fromDate,
    to: toDate
  };

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Activity-Tracker'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new GitHubAPIError('GitHub token is invalid or expired. Please check your GITHUB_TOKEN.', 401);
    }
    if (response.status === 403) {
      throw new GitHubAPIError('GitHub API rate limit exceeded or insufficient permissions.', 403);
    }
    throw new GitHubAPIError(`GitHub GraphQL API error: ${response.statusText}`, response.status);
  }

  const data = await response.json();

  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    throw new GitHubAPIError(`GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
  }

  if (!data.data?.user) {
    throw new GitHubAPIError(`User '${username}' not found`, 404);
  }

  const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar;
  
  // Transform GitHub's GraphQL response to match our expected format
  const weeks = contributionCalendar.weeks.map((week: GitHubContributionWeek) => ({
    contributionDays: week.contributionDays.map((day: GitHubContributionDay) => {
      // Convert GitHub's string levels to numbers
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      switch (day.contributionLevel) {
        case 'NONE': level = 0; break;
        case 'FIRST_QUARTILE': level = 1; break;
        case 'SECOND_QUARTILE': level = 2; break;
        case 'THIRD_QUARTILE': level = 3; break;
        case 'FOURTH_QUARTILE': level = 4; break;
        default: level = 0;
      }
      
      return {
        date: day.date,
        count: day.contributionCount,
        level
      };
    })
  }));

  return {
    weeks,
    totalContributions: contributionCalendar.totalContributions
  };
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
