import { createBrowserSupabaseClient } from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  github_username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_repos: number | null;
  followers: number | null;
  following: number | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  total_contributions: number | null;
  current_streak: number | null;
  longest_streak: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export async function ensureUserProfile(userId: string, userMetadata?: any): Promise<Profile | null> {
  const supabase = createBrowserSupabaseClient();
  
  try {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          github_username: '', // Empty string instead of null
          display_name: userMetadata?.full_name || userMetadata?.name || userMetadata?.email,
          avatar_url: userMetadata?.avatar_url,
          is_public: true
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return null;
      }
      
      return newProfile;
    }
    
    return profile;
  } catch (error) {
    console.error('Error ensuring profile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const supabase = createBrowserSupabaseClient();
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createBrowserSupabaseClient();
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}
