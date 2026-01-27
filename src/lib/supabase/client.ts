import { createBrowserClient } from '@supabase/ssr';

export const getSupabase = () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }
    return null;
};

// Safe export for existing code - will be null on server/build
export const supabase = (typeof window !== 'undefined') ? getSupabase() : null as any;
