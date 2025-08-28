export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
  user: GitHubUser;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  size: number;
}

export interface LanguageStats {
  [language: string]: number;
}

export interface ActivityStats {
  longestStreak: number;
  currentStreak: number;
  totalContributions: number;
  averagePerDay: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  contributionsLastYear: number;
}

export interface GitHubAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'profile' | 'contribution' | 'repository' | 'social' | 'milestone';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface GitHubProfileAchievements {
  profileCompletion: number;
  achievements: GitHubAchievement[];
  badges: string[];
  specialBadges: string[];
}

export interface GitHubAnalytics {
  user: GitHubUser;
  contributions: ContributionData;
  repositories: Repository[];
  languages: LanguageStats;
  stats: ActivityStats;
  achievements?: GitHubProfileAchievements;
}


