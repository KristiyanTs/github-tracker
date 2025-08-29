-- Enable RLS (Row Level Security) on existing tables
alter table public.profiles enable row level security;
alter table public.user_searches enable row level security;

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
