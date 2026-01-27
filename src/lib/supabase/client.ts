import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (typeof window !== 'undefined' && supabaseUrl)
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null as any; // Fallback for SSR/Build
