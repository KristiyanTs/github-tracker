-- Enable RLS (Row Level Security)
alter table if exists public.profiles enable row level security;
alter table if exists public.user_searches enable row level security;

-- Create profiles table
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  github_username text not null,
  display_name text,
  avatar_url text,
  bio text,
  public_repos integer,
  followers integer,
  following integer,
  location text,
  company text,
  blog text,
  twitter_username text,
  total_contributions integer,
  current_streak integer,
  longest_streak integer,
  is_public boolean default true,
  
  -- Ensure one profile per user per github username
  unique(user_id, github_username)
);

-- Create user_searches table to track search history
create table if not exists public.user_searches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  github_username text not null,
  search_count integer default 1,
  
  -- Ensure one record per user per github username
  unique(user_id, github_username)
);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for profiles updated_at
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- RLS Policies for profiles table
drop policy if exists "Users can view their own profiles" on public.profiles;
create policy "Users can view their own profiles"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view public profiles" on public.profiles;
create policy "Users can view public profiles"
  on public.profiles for select
  using (is_public = true);

drop policy if exists "Users can insert their own profiles" on public.profiles;
create policy "Users can insert their own profiles"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profiles" on public.profiles;
create policy "Users can update their own profiles"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own profiles" on public.profiles;
create policy "Users can delete their own profiles"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- RLS Policies for user_searches table
drop policy if exists "Users can view their own searches" on public.user_searches;
create policy "Users can view their own searches"
  on public.user_searches for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own searches" on public.user_searches;
create policy "Users can insert their own searches"
  on public.user_searches for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own searches" on public.user_searches;
create policy "Users can update their own searches"
  on public.user_searches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own searches" on public.user_searches;
create policy "Users can delete their own searches"
  on public.user_searches for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_github_username_idx on public.profiles(github_username);
create index if not exists profiles_is_public_idx on public.profiles(is_public);
create index if not exists user_searches_user_id_idx on public.user_searches(user_id);
create index if not exists user_searches_github_username_idx on public.user_searches(github_username);
