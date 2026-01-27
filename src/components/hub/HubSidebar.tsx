'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeftRight, Package, Settings } from 'lucide-react';
import { HubView } from '@/hooks/useHubState';

interface HubSidebarProps {
    activeView: HubView;
    onViewChange: (view: HubView) => void;
    notificationCount: number;
}

export const HubSidebar = ({ activeView, onViewChange, notificationCount }: HubSidebarProps) => {
    const navItems = [
        {
            id: 'marketplace' as HubView,
            label: 'السوق',
            icon: ShoppingBag,
            color: 'emerald',
        },
        {
            id: 'my-trades' as HubView,
            label: 'تداولاتي',
            icon: ArrowLeftRight,
            color: 'blue',
            hasNotification: notificationCount > 0,
        },
        {
            id: 'my-offers' as HubView,
            label: 'عروضي',
            icon: Package,
            color: 'purple',
        },
        {
            id: 'settings' as HubView,
            label: 'الإعدادات',
            icon: Settings,
            color: 'slate',
        },
    ];

    return (
        <div className="fixed top-0 right-0 h-screen w-20 bg-white border-l border-slate-200 z-40 flex flex-col items-center py-8 gap-6">
            {/* Logo/Brand */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/20 mb-4">
                A
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col gap-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative group"
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-emerald-500 rounded-l-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon Container */}
                            <div
                                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                  ${isActive
                                        ? 'bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }
                `}
                            >
                                <Icon className="w-6 h-6" />

                                {/* Notification Dot */}
                                {item.hasNotification && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-full h-full bg-red-500 rounded-full"
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap shadow-xl">
                                    {item.label}
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-900 rotate-45" />
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </nav>

            {/* User Avatar at Bottom */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg">
                U
            </div>
        </div>
    );
};
