# Profile Creation Setup

This document explains how to set up automatic profile creation when users sign in with Google or GitHub.

## Database Changes

### 1. Apply the Migration

Run the new migration to create the database trigger:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in your Supabase dashboard
```

The migration file `supabase/migrations/20250829085000_create_profile_trigger.sql` creates:
- A function `handle_new_user()` that automatically creates a profile
- A trigger `on_auth_user_created` that fires when a new user signs up
- Proper permissions for the function

### 2. What the Trigger Does

When a new user signs up (either through Google OAuth or GitHub OAuth), the trigger automatically:
- Creates a new profile in the `profiles` table
- Sets the `user_id` to the new user's ID
- Sets `display_name` from OAuth metadata (full_name, name, or email)
- Sets `avatar_url` from OAuth metadata
- Sets `github_username` to `null` (user must set this manually)
- Sets `is_public` to `true` by default

## Code Changes

### 1. Profile Utilities (`src/lib/profile-utils.ts`)

New utility functions for profile management:
- `ensureUserProfile()` - Creates profile if it doesn't exist
- `updateProfile()` - Updates existing profile
- `getProfile()` - Retrieves user profile

### 2. Auth Context Updates (`src/lib/auth-context.tsx`)

Enhanced authentication context that:
- Automatically ensures profile exists when user signs in
- Provides `ensureProfile()` function for manual profile creation
- Handles profile creation on both client and server side

### 3. Auth Callback Updates (`src/app/auth/callback/route.ts`)

Server-side profile creation as a fallback:
- Checks if profile exists after OAuth callback
- Creates profile if missing
- Ensures profile creation even if database trigger fails

### 4. Profile Setup Component (`src/components/ProfileSetup.tsx`)

Optional component for users to:
- Set their GitHub username after signup
- Complete their profile setup
- Update profile information

## How It Works

1. **User signs in** with Google or GitHub OAuth
2. **Database trigger** automatically creates a profile
3. **Auth callback** verifies profile creation (fallback)
4. **Client-side** ensures profile exists and handles updates
5. **User can optionally** set their GitHub username via ProfileSetup component

## Testing

To test the setup:

1. Sign out if currently signed in
2. Sign in with a new Google or GitHub account
3. Check the Supabase dashboard to verify a profile was created
4. Verify the profile has the correct user_id and metadata

## Troubleshooting

### Profile Not Created

If profiles aren't being created automatically:

1. Check if the migration was applied successfully
2. Verify the trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`
3. Check function exists: `SELECT * FROM information_schema.routines WHERE routine_name = 'handle_new_user';`
4. Check Supabase logs for any errors

### Permission Issues

If you get permission errors:

1. Ensure RLS policies are properly set
2. Check that the function has `SECURITY DEFINER`
3. Verify the function has proper grants

## Security Notes

- The trigger function runs with `SECURITY DEFINER` to bypass RLS
- Profiles are created with `is_public = true` by default
- Users can update their own profiles through the UI
- RLS policies ensure users can only access their own data
