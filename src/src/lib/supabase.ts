import { createClient } from '@supabase/supabase-js';

// Resolve Supabase public URL and Key safely from environment or Vite defines
const getSupabaseConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' ? (process.env as any) : {};

  const url =
    metaEnv?.VITE_SUPABASE_URL ||
    metaEnv?.NEXT_PUBLIC_SUPABASE_URL ||
    procEnv?.NEXT_PUBLIC_SUPABASE_URL ||
    procEnv?.SUPABASE_URL ||
    'https://fckwozeoojjscyjedmcc.supabase.co';

  const anonKey =
    metaEnv?.VITE_SUPABASE_ANON_KEY ||
    metaEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    metaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    procEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    procEnv?.SUPABASE_ANON_KEY ||
    procEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return { url, anonKey };
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

// Initialize client if key is present, or create a mock/fallback client
export const supabase = createClient(
  supabaseUrl || 'https://fckwozeoojjscyjedmcc.supabase.co',
  supabaseAnonKey || 'dummy-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseAnonKey !== 'dummy-anon-key-placeholder';
};
