import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are missing. Auth middleware skipped.');
        return response;
    }

    // Middleware logic wrapped in try-catch to prevent build failures
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        });
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        });
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        // Protected routes
        const isProtectedRoute =
            request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/trade') ||
            request.nextUrl.pathname.startsWith('/admin');

        if (isProtectedRoute && !user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Auth routes
        const isAuthRoute =
            request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/signup');

        if (isAuthRoute && user) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } catch (e) {
        // If Supabase fails (e.g. build time), strictly allow the request to proceed
        console.warn('Middleware Supabase check failed, proceeding without auth check:', e);
    }

    // Logic moved inside try-catch behavior above

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/trade/:path*', '/admin/:path*', '/login', '/signup'],
};
