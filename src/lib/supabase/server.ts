import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServer = async () => {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are missing');
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set(name, value, options);
                    } catch (error) {
                        // Handled in middleware
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set(name, '', { ...options, maxAge: 0 });
                    } catch (error) {
                        // Handled in middleware
                    }
                },
            },
        }
    );
};
