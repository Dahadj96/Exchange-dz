'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeftRight, Package, Settings } from 'lucide-react';
import { HubView } from '@/hooks/useHubState';

interface HubBottomNavProps {
    activeView: HubView;
    onViewChange: (view: HubView) => void;
    notificationCount: number;
}

export const HubBottomNav = ({ activeView, onViewChange, notificationCount }: HubBottomNavProps) => {
    const navItems = [
        { id: 'marketplace' as HubView, label: 'السوق', icon: ShoppingBag },
        { id: 'my-trades' as HubView, label: 'تداولاتي', icon: ArrowLeftRight, hasNotification: notificationCount > 0 },
        { id: 'my-offers' as HubView, label: 'عروضي', icon: Package },
        { id: 'settings' as HubView, label: 'الإعدادات', icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 lg:hidden">
            <div className="flex items-center justify-around px-2 py-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[60px]"
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobileActiveIndicator"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative">
                                <Icon
                                    className={`w-6 h-6 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'
                                        }`}
                                />
                                {item.hasNotification && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-xs font-bold transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-500'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
