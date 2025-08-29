-- Make github_username nullable in profiles table
-- This allows creating profiles for new users who haven't set their GitHub username yet

alter table public.profiles alter column github_username drop not null;

-- Also make github_username nullable in user_searches table for consistency
alter table public.user_searches alter column github_username drop not null;
