'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    if (!supabase) return null;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phoneNumber,
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-32 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                            <Wallet className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">إنشاء حساب جديد</h1>
                        <p className="text-slate-500 font-medium">انضم إلى أكبر منصة تبادل عملات في الجزائر</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-bold flex items-center gap-2 justify-center">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 mr-2">الاسم الكامل</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                        placeholder="عبد الرحمن"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 mr-2">رقم الهاتف</label>
                                <div className="relative">
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                        placeholder="05 50 00 00 00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mr-2">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mr-2">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 text-lg flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'جاري التحميل...' : (
                                <>
                                    إنشاء الحساب
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-500 font-medium">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-emerald-600 font-black hover:underline">
                                سجل الدخول هنا
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
