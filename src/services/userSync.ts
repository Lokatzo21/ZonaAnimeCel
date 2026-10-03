import { supabase } from './supabase';

export interface UserSyncRow {
  user_id: string;
  key: string;
  value: string;
  updated_at?: string;
}

export const syncService = {
  // Sync profile to user_profiles table
  syncUserProfile: async (userId: string, email: string) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: userId,
            email: email,
            last_sign_in_at: now
          },
          { onConflict: 'id' }
        );
      if (error) {
        console.warn('user_profiles sync warning:', error.message);
      }
      return data;
    } catch (e) {
      console.warn('Error syncing user_profiles:', e);
      return null;
    }
  },

  // Load all synced data for a logged-in user
  loadUserData: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_sync')
        .select('key, value')
        .eq('user_id', userId);

      if (error || !data) {
        return {};
      }

      const map: Record<string, any> = {};
      for (const row of data) {
        try {
          map[row.key] = JSON.parse(row.value);
        } catch {
          map[row.key] = row.value;
        }
      }
      return map;
    } catch (e) {
      console.warn('Error loading user_sync data:', e);
      return {};
    }
  },

  // Save a single key-value pair to user_sync
  saveUserKey: async (userId: string, key: string, value: any) => {
    if (!userId) return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_sync')
        .upsert(
          {
            user_id: userId,
            key: key,
            value: serialized,
            updated_at: now
          },
          { onConflict: 'user_id,key' }
        );
      if (error && error.code !== '42501') {
        try {
          await supabase.from('user_sync').delete().match({ user_id: userId, key: key });
          await supabase.from('user_sync').insert({
            user_id: userId,
            key: key,
            value: serialized,
            updated_at: now
          });
        } catch {}
      }
    } catch {
      // Safe fallback - localStorage handles client persistence
    }
  }
};
