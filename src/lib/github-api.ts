import { GitHubUser, Repository, LanguageStats, ContributionData, ActivityStats, GitHubAnalytics, ContributionWeek, GitHubProfileAchievements, GitHubAchievement } from '@/types/github';

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
    
      // Validate the contributions data
  if (!contributions.weeks || contributions.weeks.length === 0) {
    throw new Error('No contribution data received from GitHub API');
  }
  
  // Validate date ranges are reasonable
  const allDays = contributions.weeks.flatMap(week => week.contributionDays);
  if (allDays.length > 0) {
    const dates = allDays.map(day => new Date(day.date).getTime()).sort();
    const dateRange = dates[dates.length - 1] - dates[0];
    const maxReasonableRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    
    if (dateRange > maxReasonableRange) {
      console.warn('Warning: Contribution data spans more than 1 year');
    }
  }
    
    return {
      user,
      ...contributions
    };
  } catch (error) {
    console.error('Failed to fetch real contribution data:', error);
    
    // Following user preference: don't use fake data, show that data is unavailable
    throw new GitHubAPIError(
      `GitHub contribution data is currently unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  
  // Validate token format (should be a valid GitHub personal access token)
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    console.warn('GitHub token format appears invalid. Expected format: ghp_... or github_pat_...');
  }

  const targetYear = year || new Date().getFullYear();
  const currentDate = new Date();
  
  // If requesting current year, use current date as end date
  // If requesting past year, use end of that year
  const endDate = targetYear === currentDate.getFullYear() ? currentDate : new Date(targetYear, 11, 31);
  const fromDate = `${targetYear}-01-01T00:00:00Z`;
  const toDate = endDate.toISOString();
  
  console.log(`Fetching contributions for ${username} from ${fromDate} to ${toDate}`);

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
  
  console.log('GraphQL query:', query);
  console.log('GraphQL variables:', variables);

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Activity-Tracker',
      'Accept': 'application/vnd.github.v4+json'
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
  
  console.log('Raw GitHub API response:', {
    hasData: !!data.data,
    hasUser: !!data.data?.user,
    hasContributions: !!data.data?.user?.contributionsCollection,
    responseStatus: response.status,
    responseHeaders: Object.fromEntries(response.headers.entries())
  });

  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    throw new GitHubAPIError(`GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
  }

  if (!data.data?.user) {
    throw new GitHubAPIError(`User '${username}' not found`, 404);
  }
  
  if (!data.data.user.contributionsCollection) {
    throw new GitHubAPIError('User has no contribution data available');
  }

  const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar;
  
  // Validate the contribution calendar data
  if (!contributionCalendar || !contributionCalendar.weeks || !Array.isArray(contributionCalendar.weeks)) {
    throw new GitHubAPIError('Invalid contribution calendar data received from GitHub API');
  }
  
  // Validate total contributions is a reasonable number
  if (typeof contributionCalendar.totalContributions !== 'number' || contributionCalendar.totalContributions < 0) {
    console.warn('Warning: Invalid total contributions value:', contributionCalendar.totalContributions);
  }
  
  // Log raw data for debugging
  console.log(`Raw contribution data for ${username}:`, {
    totalContributions: contributionCalendar.totalContributions,
    weeksCount: contributionCalendar.weeks.length,
    sampleWeek: contributionCalendar.weeks[0]
  });
  
  // Transform GitHub's GraphQL response to match our expected format
  const weeks = contributionCalendar.weeks.map((week: GitHubContributionWeek) => {
    // Validate week data
    if (!week.contributionDays || !Array.isArray(week.contributionDays)) {
      console.warn('Invalid week data received:', week);
      return { contributionDays: [] };
    }
    
    // Validate that each week has exactly 7 days (GitHub's standard)
    if (week.contributionDays.length !== 7) {
      console.warn(`Warning: Week has ${week.contributionDays.length} days instead of 7:`, week);
    }
    
    return {
      contributionDays: week.contributionDays.map((day: GitHubContributionDay) => {
        // Validate day data
        if (!day.date || typeof day.contributionCount !== 'number') {
          console.warn('Invalid day data received:', day);
          return {
            date: day.date || '1970-01-01',
            count: 0,
            level: 0
          };
        }
        
        // Validate date format (should be YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
          console.warn('Invalid date format received:', day.date);
        }
        
        // Validate contribution count is reasonable
        if (day.contributionCount > 1000) {
          console.warn('Unusually high contribution count:', day.contributionCount, 'for date:', day.date);
        }
        
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
      }).filter(day => day.count >= 0) // Filter out invalid days
    };
  });

  // Filter out empty weeks and validate final data
  const validWeeks = weeks.filter((week: { contributionDays: { length: number }[] }) => week.contributionDays.length > 0);
  
  if (validWeeks.length === 0) {
    throw new GitHubAPIError('No valid contribution data found for the specified time period');
  }
  
  // Calculate total days and validate
  const totalDays = validWeeks.reduce((sum: number, week: { contributionDays: { length: number }[] }) => sum + week.contributionDays.length, 0);
  
  // Validate that we have a reasonable number of days
  if (totalDays < 7) {
    console.warn('Warning: Very few contribution days found:', totalDays);
  }
  
  if (totalDays > 400) {
    console.warn('Warning: Unusually many contribution days found:', totalDays);
  }
  
  // Log transformed data for debugging
  console.log(`Transformed contribution data for ${username}:`, {
    weeksCount: validWeeks.length,
    totalDays,
    sampleDay: validWeeks[0]?.contributionDays[0],
    dateRange: {
      first: validWeeks[0]?.contributionDays[0]?.date,
      last: validWeeks[validWeeks.length - 1]?.contributionDays[6]?.date
    }
  });

  return {
    weeks: validWeeks,
    totalContributions: contributionCalendar.totalContributions
  };
}

export function calculateActivityStats(contributionData: ContributionData, year?: number): ActivityStats {
  // Validate input data
  if (!contributionData || !contributionData.weeks || contributionData.weeks.length === 0) {
    throw new Error('Invalid contribution data: missing or empty weeks data');
  }
  
  const allDays = contributionData.weeks.flatMap(week => week.contributionDays);
  
  // Validate days data
  if (!allDays || allDays.length === 0) {
    throw new Error('Invalid contribution data: no contribution days found');
  }
  
  const totalContributions = allDays.reduce((sum, day) => sum + day.count, 0);
  
  // Sort days by date to ensure proper chronological order
  const sortedDays = allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Only calculate current streak for current year data
  const currentYear = new Date().getFullYear();
  const isCurrentYearData = !year || year === currentYear;
  
  if (isCurrentYearData) {
    // Calculate current streak (consecutive days from most recent)
    // Start from the end (most recent) and work backwards
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = sortedDays[i];
      if (day.count > 0) {
        currentStreak++;
      } else {
        break; // Stop at first day with no contributions
      }
    }
  }
  // For historical years, current streak doesn't make sense so leave it as 0
  
  // Calculate longest streak
  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    if (day.count > 0) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Find most active day and month
  const dayStats: { [key: string]: number } = {};
  const monthStats: { [key: string]: number } = {};
  
  allDays.forEach(day => {
    // Ensure consistent date parsing by using UTC
    const date = new Date(day.date + 'T00:00:00Z');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const monthName = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    
    dayStats[dayName] = (dayStats[dayName] || 0) + day.count;
    monthStats[monthName] = (monthStats[monthName] || 0) + day.count;
  });
  
  const mostActiveDay = Object.keys(dayStats).reduce((a, b) => 
    dayStats[a] > dayStats[b] ? a : b
  );
  
  const mostActiveMonth = Object.keys(monthStats).reduce((a, b) => 
    monthStats[a] > monthStats[b] ? a : b
  );
  
  const stats = {
    longestStreak,
    currentStreak,
    totalContributions,
    averagePerDay: totalContributions / allDays.length,
    mostActiveDay,
    mostActiveMonth,
    contributionsLastYear: totalContributions
  };
  
  // Log calculated stats for debugging
  console.log('Calculated activity stats:', {
    totalDays: allDays.length,
    totalContributions,
    currentStreak,
    longestStreak,
    mostActiveDay,
    mostActiveMonth,
    averagePerDay: stats.averagePerDay
  });
  
  // Validate that the stats make sense
  if (totalContributions < 0) {
    console.warn('Warning: Negative total contributions detected');
  }
  
  if (currentStreak > allDays.length) {
    console.warn('Warning: Current streak exceeds total days');
  }
  
  if (longestStreak > allDays.length) {
    console.warn('Warning: Longest streak exceeds total days');
  }
  
  // Check for unrealistic contribution counts (GitHub typically has reasonable limits)
  const maxReasonableContributions = 1000; // Per day
  const daysWithHighContributions = allDays.filter(day => day.count > maxReasonableContributions);
  if (daysWithHighContributions.length > 0) {
    console.warn(`Warning: ${daysWithHighContributions.length} days have unusually high contribution counts (>${maxReasonableContributions})`);
  }
  
  // Validate average contributions per day
  if (stats.averagePerDay > 100) {
    console.warn('Warning: Unusually high average contributions per day:', stats.averagePerDay);
  }
  
  // Validate that most active day and month are not empty
  if (!stats.mostActiveDay || !stats.mostActiveMonth) {
    console.warn('Warning: Most active day or month is empty');
  }
  
  // Log additional validation info
  console.log('Data validation summary:', {
    totalDays: allDays.length,
    daysWithContributions: allDays.filter(day => day.count > 0).length,
    daysWithoutContributions: allDays.filter(day => day.count === 0).length,
    maxContributionsInDay: Math.max(...allDays.map(day => day.count)),
    minContributionsInDay: Math.min(...allDays.map(day => day.count))
  });
  
  return stats;
}

// Calculate GitHub profile achievements based on user data
function calculateProfileAchievements(user: GitHubUser, stats: ActivityStats, repositories: Repository[]): GitHubProfileAchievements {
  const achievements: GitHubAchievement[] = [];
  
  // Profile completion achievements
  const profileFields = [
    { field: user.name, name: 'Name Set', description: 'Set your display name' },
    { field: user.bio, name: 'Bio Added', description: 'Added a bio to your profile' },
    { field: user.location, name: 'Location Set', description: 'Set your location' },
    { field: user.company, name: 'Company Added', description: 'Added company information' },
    { field: user.blog, name: 'Website Added', description: 'Added a website link' }
  ];
  
  const completedFields = profileFields.filter(f => f.field).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
  
  // Profile completion badge
  if (profileCompletion >= 100) {
    achievements.push({
      id: 'profile-master',
      name: 'Profile Master',
      description: 'Complete profile with all fields filled',
      icon: '🏆',
      category: 'profile',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (profileCompletion >= 80) {
    achievements.push({
      id: 'profile-expert',
      name: 'Profile Expert',
      description: 'Nearly complete profile',
      icon: '⭐',
      category: 'profile',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (profileCompletion >= 60) {
    achievements.push({
      id: 'profile-enthusiast',
      name: 'Profile Enthusiast',
      description: 'Good profile completion',
      icon: '🌟',
      category: 'profile',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
  
  // Repository achievements
  if (user.public_repos >= 100) {
    achievements.push({
      id: 'repository-legend',
      name: 'Repository Legend',
      description: '100+ public repositories',
      icon: '📚',
      category: 'repository',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (user.public_repos >= 50) {
    achievements.push({
      id: 'repository-expert',
      name: 'Repository Expert',
      description: '50+ public repositories',
      icon: '📖',
      category: 'repository',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (user.public_repos >= 10) {
    achievements.push({
      id: 'repository-enthusiast',
      name: 'Repository Enthusiast',
      description: '10+ public repositories',
      icon: '📝',
      category: 'repository',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (user.public_repos >= 1) {
    achievements.push({
      id: 'first-repository',
      name: 'First Repository',
      description: 'Created your first repository',
      icon: '🎯',
      category: 'repository',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
  
  // Contribution achievements
  if (stats.totalContributions >= 10000) {
    achievements.push({
      id: 'contribution-legend',
      name: 'Contribution Legend',
      description: '10,000+ total contributions',
      icon: '🔥',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (stats.totalContributions >= 5000) {
    achievements.push({
      id: 'contribution-master',
      name: 'Contribution Master',
      description: '5,000+ total contributions',
      icon: '⚡',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (stats.totalContributions >= 1000) {
    achievements.push({
      id: 'contribution-expert',
      name: 'Contribution Expert',
      description: '1,000+ total contributions',
      icon: '💪',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (stats.totalContributions >= 100) {
    achievements.push({
      id: 'contribution-enthusiast',
      name: 'Contribution Enthusiast',
      description: '100+ total contributions',
      icon: '🚀',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
  
  // Streak achievements
  if (stats.longestStreak >= 365) {
    achievements.push({
      id: 'streak-legend',
      name: 'Streak Legend',
      description: '365+ day contribution streak',
      icon: '🌅',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (stats.longestStreak >= 100) {
    achievements.push({
      id: 'streak-master',
      name: 'Streak Master',
      description: '100+ day contribution streak',
      icon: '🔥',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (stats.longestStreak >= 30) {
    achievements.push({
      id: 'streak-expert',
      name: 'Streak Expert',
      description: '30+ day contribution streak',
      icon: '📈',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (stats.longestStreak >= 7) {
    achievements.push({
      id: 'streak-enthusiast',
      name: 'Streak Enthusiast',
      description: '7+ day contribution streak',
      icon: '📊',
      category: 'contribution',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
  
  // Social achievements
  if (user.followers >= 1000) {
    achievements.push({
      id: 'social-legend',
      name: 'Social Legend',
      description: '1,000+ followers',
      icon: '👑',
      category: 'social',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (user.followers >= 500) {
    achievements.push({
      id: 'social-expert',
      name: 'Social Expert',
      description: '500+ followers',
      icon: '🌟',
      category: 'social',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (user.followers >= 100) {
    achievements.push({
      id: 'social-enthusiast',
      name: 'Social Enthusiast',
      description: '100+ followers',
      icon: '💫',
      category: 'social',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (user.followers >= 10) {
    achievements.push({
      id: 'social-starter',
      name: 'Social Starter',
      description: '10+ followers',
      icon: '✨',
      category: 'social',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
  
  // Milestone achievements
  const accountAge = new Date().getTime() - new Date(user.created_at).getTime();
  const accountAgeYears = Math.floor(accountAge / (1000 * 60 * 60 * 24 * 365));
  
  if (accountAgeYears >= 10) {
    achievements.push({
      id: 'veteran',
      name: 'GitHub Veteran',
      description: '10+ years on GitHub',
      icon: '🏛️',
      category: 'milestone',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (accountAgeYears >= 5) {
    achievements.push({
      id: 'experienced',
      name: 'Experienced Developer',
      description: '5+ years on GitHub',
      icon: '🎓',
      category: 'milestone',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (accountAgeYears >= 2) {
    achievements.push({
      id: 'established',
      name: 'Established Developer',
      description: '2+ years on GitHub',
      icon: '🎯',
      category: 'milestone',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  } else if (accountAgeYears >= 1) {
    achievements.push({
      id: 'one-year',
      name: 'One Year Strong',
      description: '1+ year on GitHub',
      icon: '🎉',
      category: 'milestone',
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
  
  // Special badges based on activity patterns
  const specialBadges: string[] = [];
  
  if (stats.averagePerDay >= 10) {
    specialBadges.push('🚀 High Activity');
  }
  
  if (repositories.length > 0) {
    const hasStarredRepos = repositories.some(repo => repo.stargazers_count > 0);
    if (hasStarredRepos) {
      specialBadges.push('⭐ Starred Projects');
    }
    
    const hasForkedRepos = repositories.some(repo => repo.forks_count > 0);
    if (hasForkedRepos) {
      specialBadges.push('🍴 Forked Projects');
    }
    
    // Repository size achievements
    const totalRepoSize = repositories.reduce((sum, repo) => sum + repo.size, 0);
    if (totalRepoSize > 1000000) { // 1MB
      specialBadges.push('💾 Large Codebase');
    }
    
    // Most popular repository
    const mostStarredRepo = repositories.reduce((max, repo) => 
      repo.stargazers_count > max.stargazers_count ? repo : max
    );
    if (mostStarredRepo.stargazers_count >= 100) {
      specialBadges.push('🌟 Popular Project');
    } else if (mostStarredRepo.stargazers_count >= 10) {
      specialBadges.push('⭐ Rising Star');
    }
  }
  
  if (user.public_gists > 0) {
    specialBadges.push('📝 Gist Creator');
  }
  
  // Activity pattern badges
  if (stats.currentStreak >= 7) {
    specialBadges.push('🔥 Active Streak');
  }
  
  if (stats.contributionsLastYear >= 1000) {
    specialBadges.push('📈 Consistent Contributor');
  }
  
  // Account age badges
  if (accountAgeYears >= 1) {
    specialBadges.push('🎯 Established Developer');
  }
  
  return {
    profileCompletion,
    achievements,
    badges: achievements.map(a => a.icon + ' ' + a.name),
    specialBadges
  };
}

export async function fetchGitHubAnalytics(username: string): Promise<GitHubAnalytics> {
  try {
    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token is missing from environment variables');
      throw new GitHubAPIError('GitHub token is required. Please set GITHUB_TOKEN environment variable.', 401);
    }
    
    // Log environment info for debugging
    console.log('Environment check:', {
      hasToken: !!process.env.GITHUB_TOKEN,
      tokenLength: process.env.GITHUB_TOKEN?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      username
    });
    
    const [contributions, repositories, languages] = await Promise.all([
      fetchContributions(username),
      fetchUserRepositories(username),
      fetchLanguageStats(username)
    ]);

    const stats = calculateActivityStats(contributions);
    const achievements = calculateProfileAchievements(contributions.user, stats, repositories);

    return {
      user: contributions.user,
      contributions,
      repositories,
      languages,
      stats,
      achievements
    };
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    throw new GitHubAPIError(`Failed to fetch GitHub analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
