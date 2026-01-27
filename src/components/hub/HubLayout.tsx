'use client';

import React, { useState, useEffect } from 'react';
import { useHubState } from '@/hooks/useHubState';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase/client';
import { HubSidebar } from './HubSidebar';
import { HubMiddleColumn } from './HubMiddleColumn';
import { HubContextPanel } from './HubContextPanel';
import { HubBottomNav } from './HubBottomNav';
import { HubProfileModal } from './HubProfileModal';
import { NotificationDropdown } from './NotificationDropdown';
import { User } from 'lucide-react';

interface HubLayoutProps {
    userId: string;
}

export const HubLayout = ({ userId }: HubLayoutProps) => {
    if (!supabase) return null;
    const {
        activeView,
        selectedTradeId,
        notificationCount,
        setActiveView,
        openTradeRoom,
        closeTradeRoom,
        setNotificationCount,
    } = useHubState();

    const notifications = useNotifications(userId);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Update notification count from real-time notifications
    useEffect(() => {
        setNotificationCount(notifications.totalCount);
    }, [notifications.totalCount, setNotificationCount]);

    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">
            {/* Desktop: Right Sidebar (20%) */}
            <div className="hidden lg:block">
                <HubSidebar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    notificationCount={notificationCount}
                />
            </div>


            {/* Main Content Area - Adjusted padding for global header */}
            <div className="lg:pr-20 lg:pl-0 pt-4">{/* Reduced pt since global header exists */}
                <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    {/* 12-Column Grid: 9 for content, 3 for sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Content Column (9 columns on desktop, full width on mobile) */}
                        <div className="col-span-12 lg:col-span-9 min-h-[calc(100vh-8rem)] pb-20 lg:pb-0">
                            <HubMiddleColumn
                                activeView={activeView}
                                selectedTradeId={selectedTradeId}
                                onTradeClick={openTradeRoom}
                                onBackFromTrade={closeTradeRoom}
                                userId={userId}
                            />
                        </div>

                        {/* Left Sidebar: Context Panel (3 columns on desktop, hidden on mobile) */}
                        <div className="hidden lg:block col-span-12 lg:col-span-3">
                            <div className="sticky top-24 max-w-[320px]">
                                <HubContextPanel userId={userId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Bottom Navigation */}
            <HubBottomNav
                activeView={activeView}
                onViewChange={setActiveView}
                notificationCount={notificationCount}
            />

            {/* Mobile: Profile Button (Floating) */}
            <button
                onClick={() => setIsProfileModalOpen(true)}
                className="fixed top-6 left-6 w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full shadow-xl flex items-center justify-center text-white z-40 lg:hidden"
            >
                <User className="w-6 h-6" />
            </button>

            {/* Mobile: Profile Modal */}
            <HubProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userId={userId}
            />
        </div>
    );
};
