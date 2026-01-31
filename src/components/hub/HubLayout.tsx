'use client';

import React, { useState, useEffect } from 'react';
import { useHubState } from '@/hooks/useHubState';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/utils/supabase/client';
import { HubSidebar } from './HubSidebar';
import { HubMiddleColumn } from './HubMiddleColumn';
import { HubBottomNav } from './HubBottomNav';
import { NotificationDropdown } from './NotificationDropdown';

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
                    {/* 12-Column Grid: Full width content */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Main Content Column (Full width) */}
                        <div className="col-span-12 min-h-[calc(100vh-8rem)] pb-20 lg:pb-0">
                            <HubMiddleColumn
                                activeView={activeView}
                                selectedTradeId={selectedTradeId}
                                onTradeClick={openTradeRoom}
                                onBackFromTrade={closeTradeRoom}
                                userId={userId}
                            />
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
        </div>
    );
};
