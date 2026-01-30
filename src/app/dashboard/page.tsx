'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { HubLayout } from '@/components/hub/HubLayout';
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';
import { ClientOnly } from '@/components/ClientOnly';

function DashboardContent() {
    if (!supabase) return null;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<'hub' | 'settings'>('hub');

    useEffect(() => {
        checkAuth();
    }, []);

    // Monitor URL query parameters for view switching
    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'settings') {
            setActiveView('settings');
        } else {
            setActiveView('hub');
        }
    }, [searchParams]);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        setUserId(user.id);
        setIsLoading(false);
    };

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

    if (!userId) {
        return null;
    }

    // Render the appropriate view based on URL parameter
    return (
        <ClientOnly>
            <div suppressHydrationWarning>
                {activeView === 'settings' ? (
                    <DashboardSettings userId={userId} />
                ) : (
                    <HubLayout userId={userId} />
                )}
            </div>
        </ClientOnly>
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
