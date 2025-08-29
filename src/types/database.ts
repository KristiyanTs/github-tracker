export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string | null;
          github_username: string;
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
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          github_username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          public_repos?: number | null;
          followers?: number | null;
          following?: number | null;
          location?: string | null;
          company?: string | null;
          blog?: string | null;
          twitter_username?: string | null;
          total_contributions?: number | null;
          current_streak?: number | null;
          longest_streak?: number | null;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          github_username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          public_repos?: number | null;
          followers?: number | null;
          following?: number | null;
          location?: string | null;
          company?: string | null;
          blog?: string | null;
          twitter_username?: string | null;
          total_contributions?: number | null;
          current_streak?: number | null;
          longest_streak?: number | null;
          is_public?: boolean;
        };
      };
      user_searches: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          github_username: string;
          search_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          github_username: string;
          search_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          github_username?: string;
          search_count?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type UserSearch = Database['public']['Tables']['user_searches']['Row'];
export type UserSearchInsert = Database['public']['Tables']['user_searches']['Insert'];
export type UserSearchUpdate = Database['public']['Tables']['user_searches']['Update'];
