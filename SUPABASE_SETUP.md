# Supabase Setup Instructions

This guide will help you set up Supabase authentication and database for the GitHub Activity application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "github-activity")
5. Enter a database password (save this securely)
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your deployment URL:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

### Enable GitHub OAuth

1. Go to **Authentication** → **Providers**
2. Find **GitHub** and click the toggle to enable it
3. You'll need to create a GitHub OAuth App:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: GitHub Activity
     - **Homepage URL**: `http://localhost:3000` (or your domain)
     - **Authorization callback URL**: `https://[YOUR_SUPABASE_REFERENCE_ID].supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
4. Back in Supabase, paste the GitHub Client ID and Client Secret
5. Click **Save**

### Enable Google OAuth

1. In **Authentication** → **Providers**, find **Google** and enable it
2. You'll need to create a Google OAuth App:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Configure the OAuth consent screen if prompted
   - Set **Authorized redirect URIs** to: `https://[YOUR_SUPABASE_REFERENCE_ID].supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
3. Back in Supabase, paste the Google Client ID and Client Secret
4. Click **Save**

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste it into the SQL Editor and run it
4. This will create:
   - `profiles` table for storing saved GitHub profiles
   - `user_searches` table for tracking search history
   - Row Level Security (RLS) policies
   - Database triggers and functions

## Step 4: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API keys** → **anon** **public** (this is safe to use in frontend)
   - **Project API keys** → **service_role** **secret** (keep this private)

## Step 5: Configure Environment Variables

1. Copy the `env.example` file to `.env.local` in your project root:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   # GitHub API Configuration
   GITHUB_TOKEN=your_github_personal_access_token_here
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # Optional: Set to production for production builds
   NODE_ENV=development
   ```

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click "Sign In" and test both GitHub and Google authentication
4. Try analyzing a GitHub profile and saving it
5. Verify that saved profiles appear on the home page

## Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**: Ensure your redirect URLs in GitHub/Google match exactly with what you configured in Supabase
2. **RLS policies not working**: Make sure you ran the complete SQL schema and that RLS is enabled
3. **Environment variables not loaded**: Restart your development server after changing `.env.local`

### Checking Logs

- **Supabase logs**: Go to **Logs** in your Supabase dashboard
- **Browser console**: Check for any JavaScript errors
- **Network tab**: Check for failed API requests

## Production Deployment

When deploying to production:

1. Update your environment variables in your hosting platform
2. Update the Site URL and Redirect URLs in Supabase to your production domain
3. Update OAuth app settings in GitHub and Google to use production URLs
4. Make sure your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set

## Security Notes

- Never commit your `.env.local` file to version control
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the frontend
- RLS policies ensure users can only access their own data
