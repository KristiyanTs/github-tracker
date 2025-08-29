-- Create function to handle new user signup and create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert a new profile for the new user
  -- Note: github_username will be null initially and needs to be set by the user
  insert into public.profiles (
    user_id,
    github_username,
    display_name,
    avatar_url,
    is_public
  ) values (
    new.id,
    null, -- Will be set when user connects GitHub or enters username
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    true
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grant necessary permissions to the function
grant usage on schema public to authenticated;
grant all on public.profiles to authenticated;
