'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
            <div className="container mx-auto px-6 lg:px-20 py-5 flex items-center justify-between">
                {/* Action Buttons - LEFT SIDE (RTL) */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-3xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                لوحة التحكم
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-3xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                خروج
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
                            >
                                تسجيل الدخول
                            </Link>
                            <Link
                                href="/signup"
                                className="px-8 py-3 bg-emerald-600 text-white rounded-3xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                إنشاء حساب
                            </Link>
                        </>
                    )}
                </div>

                {/* Desktop Navigation Links - CENTER */}
                <div className="hidden md:flex items-center gap-1 p-1 rounded-3xl bg-slate-50/80 border border-slate-200/60 backdrop-blur-md">
                    <Link href="/marketplace" className="px-6 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all text-sm font-bold">
                        السوق
                    </Link>
                    <Link href="/rates" className="px-6 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all text-sm font-bold">
                        الأسعار
                    </Link>
                    <Link href="/blog" className="px-6 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all text-sm font-bold">
                        الأخبار
                    </Link>
                </div>

                {/* Logo - RIGHT SIDE (RTL) */}
                <Link href="/">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">AssetBridge</span>
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-600/25 group-hover:rotate-6 transition-transform">
                            <Globe className="text-white w-6 h-6" />
                        </div>
                    </motion.div>
                </Link>
            </div>
        </nav>
    );
};
