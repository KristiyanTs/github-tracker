import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Create a service role supabase client to bypass RLS for auto-saving
    const supabase = createServiceRoleSupabaseClient();
    const profileData = await request.json();
    
    if (!profileData.github_username) {
      return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
    }

    // Check if an auto-saved profile with this GitHub username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('github_username', profileData.github_username)
      .is('user_id', null)
      .single();

    // Create a profile entry with null user_id to indicate auto-saved profile
    // or update existing one if it exists
    const profileToSave = {
      user_id: null, // null user_id indicates auto-saved profiles
      github_username: profileData.github_username,
      display_name: profileData.display_name,
      avatar_url: profileData.avatar_url,
      bio: profileData.bio,
      public_repos: profileData.public_repos,
      followers: profileData.followers,
      following: profileData.following,
      location: profileData.location,
      company: profileData.company,
      blog: profileData.blog,
      twitter_username: profileData.twitter_username,
      total_contributions: profileData.total_contributions,
      current_streak: profileData.current_streak,
      longest_streak: profileData.longest_streak,
      is_public: true, // Auto-saved profiles are always public
    };

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileToSave)
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('Error auto-saving profile:', result.error);
      return NextResponse.json({ error: 'Failed to auto-save profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: result.data });
  } catch (error) {
    console.error('Error in profiles auto-save POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
