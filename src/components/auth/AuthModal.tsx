'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultView?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) => {
    if (!supabase) return null;
    const router = useRouter();
    const [view, setView] = useState<'login' | 'signup'>(defaultView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            onClose();
            router.refresh();
        }
        setLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setError('');
            alert('تم إرسال رابط التفعيل إلى بريدك الإلكتروني!');
            onClose();
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">
                                    {view === 'login' ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
                                </h2>
                                <p className="text-slate-500 font-medium">
                                    {view === 'login'
                                        ? 'سجل دخولك للوصول إلى حسابك'
                                        : 'انضم إلى AssetBridge اليوم'}
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                    <p className="text-red-600 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-5">
                                {view === 'signup' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            الاسم الكامل
                                        </label>
                                        <div className="relative">
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                                placeholder="أدخل اسمك الكامل"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {view === 'login' && (
                                    <div className="text-left">
                                        <a href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-bold">
                                            نسيت كلمة المرور؟
                                        </a>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span>جاري التحميل...</span>
                                    ) : (
                                        <>
                                            {view === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
                                            <ArrowRight className="w-5 h-5" style={{ transform: 'scaleX(-1)' }} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Toggle View */}
                            <div className="mt-6 text-center">
                                <p className="text-slate-600 font-medium">
                                    {view === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                                    {' '}
                                    <button
                                        onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                        className="text-emerald-600 hover:text-emerald-700 font-black"
                                    >
                                        {view === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
