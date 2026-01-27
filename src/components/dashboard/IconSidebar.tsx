'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Settings,
    HelpCircle,
    LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export const IconSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/dashboard', id: 'dashboard' },
        { icon: ShoppingBag, label: 'السوق', href: '/marketplace', id: 'marketplace' },
        { icon: MessageSquare, label: 'تداولاتي', href: '/dashboard/trades', id: 'trades' },
        { icon: Settings, label: 'الإعدادات', href: '/dashboard/settings', id: 'settings' },
        { icon: HelpCircle, label: 'الدعم', href: '/help', id: 'support' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 bg-white/90 backdrop-blur-xl border-r border-slate-200 z-50 flex flex-col items-center py-8 gap-6">
            {/* Logo */}
            <Link href="/dashboard">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-600/20 hover:rotate-6 transition-transform cursor-pointer">
                    <span className="text-white font-black text-xl">A</span>
                </div>
            </Link>

            {/* Divider */}
            <div className="w-10 h-px bg-slate-200" />

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col gap-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link key={item.id} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group"
                            >
                                <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer
                                    ${isActive
                                        ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-600 rounded-l-full"
                                    />
                                )}

                                {/* Tooltip */}
                                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl">
                                        {item.label}
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="relative group"
            >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer">
                    <LogOut className="w-6 h-6" />
                </div>

                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl">
                        تسجيل الخروج
                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900" />
                    </div>
                </div>
            </motion.button>
        </aside>
    );
};
