-- Fix the unique constraint issue on profiles table
-- The current constraint (user_id, github_username) with github_username being null can cause issues

-- Drop the existing unique constraint
alter table public.profiles drop constraint if exists profiles_user_id_github_username_key;

-- Create a new unique constraint that only applies when github_username is not null
-- This allows multiple profiles per user (one with null github_username, others with specific usernames)
create unique index profiles_user_id_github_username_unique 
  on public.profiles (user_id, github_username) 
  where github_username is not null;

-- Also ensure one profile per user when github_username is null
create unique index profiles_user_id_null_github_unique 
  on public.profiles (user_id) 
  where github_username is null;
