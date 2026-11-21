import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Keep the legacy anon JWT as the browser-safe fallback for this project's API gateway.
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Baybble Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to the build environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://xquyfsquqqsbufmonewm.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdXlmc3F1cXFzYnVmbW9uZXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNzMyOTAsImV4cCI6MjExMDY0OTI5MH0.VGOpv_uhdsFzDa0Ma_dvkVm456Ao4v2qfJiBdc63nkg',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
