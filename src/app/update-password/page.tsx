'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    if (!supabase) return null;
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            setMessage({
                type: 'success',
                text: 'تم تحديث كلمة المرور بنجاح. جاري توجيهك...'
            });
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-44 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                            <Wallet className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">تحديث كلمة المرور</h1>
                        <p className="text-slate-500 font-medium">أدخل كلمة المرور الجديدة لحسابك</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        {message && (
                            <div className={`p-4 rounded-2xl border text-sm text-center font-bold flex items-center gap-2 justify-center ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 mr-2">كلمة المرور الجديدة</label>
                            <div className="relative">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'جاري التحديث...' : (
                                <>
                                    تحديث كلمة المرور
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
