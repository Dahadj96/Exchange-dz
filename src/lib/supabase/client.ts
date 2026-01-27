import { createBrowserClient } from '@supabase/ssr';

// Helper to validate environment variables
const getEnvVar = (name: string): string => {
    const value = process.env[name];
    if (!value && process.env.NODE_ENV === 'production') {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value || '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
