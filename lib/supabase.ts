import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Baybble Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to the build environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://xquyfsquqqsbufmonewm.supabase.co',
  supabaseAnonKey || 'sb_publishable_NUGQ-j0QJbtD5rOb-IU2YQ_kzll4bK6',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
