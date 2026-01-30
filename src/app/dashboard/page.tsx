'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { HubLayout } from '@/components/hub/HubLayout';
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';
import { useHasMounted } from '@/hooks/useHasMounted';

function DashboardContent() {
    // 1. Move all hooks to the top (Rules of Hooks)
    const hasMounted = useHasMounted();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<'hub' | 'settings'>('hub');

    // 2. Define check function
    const checkAuth = async () => {
        // If supabase client is missing (rare), just return
        if (!supabase) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        setUserId(user.id);
        setIsLoading(false);
    };

    // 3. Effects
    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'settings') {
            setActiveView('settings');
        } else {
            setActiveView('hub');
        }
    }, [searchParams]);

    // 4. Hydration Check: Return null or skeleton if not mounted
    if (!hasMounted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // 5. Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // 6. Auth Check
    if (!userId || !supabase) {
        return null;
    }

    // 7. Render
    return (
        <div suppressHydrationWarning>
            {activeView === 'settings' ? (
                <DashboardSettings userId={userId} />
            ) : (
                <HubLayout userId={userId} />
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
