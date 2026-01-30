'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, LogOut, ChevronDown, Menu, X, ChevronRight } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { NotificationDropdown } from './hub/NotificationDropdown';

export const GlobalHeader = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<{ username: string; avatar_url?: string } | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setProfile(data);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsProfileMenuOpen(false);
        router.push('/');
    };

    const handleSettingsClick = () => {
        setIsProfileMenuOpen(false);
        router.push('/dashboard?view=settings');
    };

    const isActive = (path: string) => pathname === path;

    const handleBack = () => {
        if (pathname.includes('/dashboard/')) {
            router.push('/dashboard');
        } else {
            router.back();
        }
    };

    const shouldShowBackButton = pathname !== '/' && (pathname.includes('/marketplace') || pathname.includes('/dashboard'));

    const navLinks = [
        { href: '/', label: 'الرئيسية' },
        { href: '/marketplace', label: 'السوق' },
        { href: '/about', label: 'الأخبار' },
    ];

    if (!mounted) return <div className="h-20 bg-white border-b border-slate-200" />;

    return (
        <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 overflow-visible">
            <div className="w-full px-6 py-4">
                {/* Main Container: 3-ZONE FLEXBOX with flex-row-reverse for RTL
                    In RTL, flex-row-reverse = Left to Right ordering.
                    DOM 1 (Brand) -> Visual Left
                    DOM 2 (Identity) -> Visual Right
                */}
                <div className="flex flex-row-reverse justify-between items-center w-full relative">

                    {/* ========== ZONE 1: FAR RIGHT (Identity & Controls) ========== */}
                    <div className="flex items-center gap-4 z-20">
                        {user ? (
                            <>
                                {/* Item A: Profile Dropdown (EXTREME RIGHT in RTL view) */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex flex-row-reverse items-center gap-2 pr-1 pl-4 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20 group-hover:rotate-3 transition-transform">
                                            {profile?.username?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="hidden md:flex items-center gap-1.5 pt-0.5">
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                            <span className="text-sm font-black text-slate-800">{profile?.username || 'الملف الشخصي'}</span>
                                        </div>
                                    </button>

                                    {/* Profile Dropdown Menu - ALIGN END (Right-0) */}
                                    <AnimatePresence>
                                        {isProfileMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-[90]" onClick={() => setIsProfileMenuOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-[24px] border border-slate-200 shadow-2xl z-[100] overflow-hidden"
                                                >
                                                    <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-row-reverse items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
                                                            {profile?.username?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="flex-1 text-right min-w-0">
                                                            <div className="text-sm font-black text-slate-900 truncate">{profile?.username || 'مستخدم'}</div>
                                                            <div className="text-[10px] text-slate-500 font-bold truncate">{user.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2">
                                                        <button
                                                            onClick={handleSettingsClick}
                                                            className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-right"
                                                        >
                                                            <Settings className="w-5 h-5 text-slate-400" />
                                                            <span className="font-bold text-slate-700 hidden md:block">
                                                                {profile?.username || user.email?.split('@')[0]}
                                                            </span>
                                                        </button>
                                                        <div className="my-1 border-t border-slate-100" />
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-right group"
                                                        >
                                                            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                                                            <span className="text-sm font-bold text-slate-700 group-hover:text-red-600">تسجيل الخروج</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Item B: Dashboard Link */}
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all font-black text-sm ${pathname === '/dashboard'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span className="hidden md:inline">لوحة التحكم</span>
                                </Link>

                                {/* Item C: Notification Bell - align end (right-0) */}
                                <NotificationDropdown userId={user.id} />
                            </>
                        ) : (
                            <div className="flex flex-row-reverse items-center gap-3">
                                <Link
                                    href="/signup"
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                                >
                                    حساب جديد
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-6 py-2.5 text-sm font-black text-slate-600 hover:text-emerald-600 transition-colors"
                                >
                                    دخول
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* ========== ZONE 2: CENTER (Centered Navigation) ========== */}
                    <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 z-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm tracking-wide transition-all ${isActive(link.href)
                                    ? 'text-emerald-600 font-black'
                                    : 'text-slate-500 font-bold hover:text-slate-900'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Logo & Mobile Back Button - Right side (in RTL) / Left side (Visual) */}
                    <div className="flex items-center gap-3 group z-20">
                        {shouldShowBackButton && (
                            <button
                                onClick={handleBack}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors ml-1"
                            >
                                <ChevronRight className="w-6 h-6 text-slate-600" />
                            </button>
                        )}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                A
                            </div>
                            <div className="hidden sm:block text-right">
                                <div className="text-xl font-black text-slate-900 leading-none mb-1">AssetBridge</div>
                                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-[2px]">Marketplace</div>
                            </div>
                        </Link>
                    </div>

                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="py-6 flex flex-col gap-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-4 rounded-2xl text-right font-black ${isActive(link.href) ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 bg-slate-50'}`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};
