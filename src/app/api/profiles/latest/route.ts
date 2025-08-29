import { NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = createServiceRoleSupabaseClient();

    // Get the latest fetched profiles (auto-saved profiles)
    // These are profiles with null user_id
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .is('user_id', null)
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(12); // Show last 12 fetched profiles

    if (error) {
      console.error('Error fetching latest profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch latest profiles' }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (error) {
    console.error('Error in latest profiles GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
