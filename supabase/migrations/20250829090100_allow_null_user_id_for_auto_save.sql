-- Allow user_id to be null for auto-saved profiles
-- This enables us to save profiles without requiring a user account

-- First, drop the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make user_id nullable
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add the foreign key constraint back, but allow null values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the unique constraint to handle null user_id properly
-- Drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_github_username_key;

-- Add a new unique constraint that treats null user_id specially
-- For user profiles: user_id + github_username must be unique
-- For auto-saved profiles: only github_username must be unique (user_id is null)
CREATE UNIQUE INDEX profiles_user_github_unique_idx 
ON public.profiles (COALESCE(user_id::text, 'auto-saved'), github_username);

-- Update RLS policies to handle null user_id
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
CREATE POLICY "Users can view their own profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view auto-saved profiles" ON public.profiles;
CREATE POLICY "Users can view auto-saved profiles"
  ON public.profiles FOR SELECT
  USING (user_id IS NULL AND is_public = true);

DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
CREATE POLICY "Users can insert their own profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can auto-save public profiles" ON public.profiles;
CREATE POLICY "System can auto-save public profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id IS NULL AND is_public = true);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update auto-saved profiles" ON public.profiles;
CREATE POLICY "System can update auto-saved profiles"
  ON public.profiles FOR UPDATE
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL AND is_public = true);

DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.profiles;
CREATE POLICY "Users can delete their own profiles"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);
