-- Drop the existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create function with proper permissions and error handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert a new profile for the new user
  -- Note: github_username will be empty initially and needs to be set by the user
  insert into public.profiles (
    user_id,
    github_username,
    display_name,
    avatar_url,
    is_public
  ) values (
    new.id,
    '', -- Empty string instead of null for github_username
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    true
  );
  
  return new;
exception when others then
  -- Log the error but don't fail the user creation
  raise log 'Failed to create profile for user %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grant necessary permissions to the function
grant usage on schema public to postgres;
grant usage on schema public to service_role;
grant all on public.profiles to postgres;
grant all on public.profiles to service_role;

-- Ensure the function can bypass RLS for profile creation
alter function public.handle_new_user() security definer;

-- Create a policy that allows the trigger function to insert profiles
drop policy if exists "System can insert profiles" on public.profiles;
create policy "System can insert profiles"
  on public.profiles for insert
  with check (true); -- Allow all inserts from the trigger function

-- Ensure the function owner has proper permissions
grant execute on function public.handle_new_user() to postgres;
grant execute on function public.handle_new_user() to service_role;
