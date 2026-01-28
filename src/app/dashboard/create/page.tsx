'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle,
    ChevronLeft,
    Wallet,
    ArrowRight,
    CheckCircle2,
    DollarSign,
    TrendingUp,
    Info,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const PLATFORMS = [
    { id: 'Wise', label: 'Wise', currencies: ['EUR', 'USD'] },
    { id: 'Paysera', label: 'Paysera', currencies: ['EUR'] },
    { id: 'RedotPay', label: 'RedotPay', currencies: ['USD'] },
];

export default function CreateListingPage() {
    if (!supabase) return null;
    const [step, setStep] = useState(1);
    const [platform, setPlatform] = useState('');
    const [currency, setCurrency] = useState('');
    const [amount, setAmount] = useState(''); // available_amount
    const [rate, setRate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        const numericAmount = Number(amount) || 0;
        const { error } = await supabase.from('offers').insert({
            user_id: user.id,
            platform: platform,
            currency_code: currency,
            available_amount: numericAmount,
            min_amount: 0,
            max_amount: numericAmount,
            rate: Number(rate),
            is_active: true
        });

        if (error) {
            console.log('Error creating offer:', error);
            alert('Error creating listing: ' + error.message);
            setLoading(false);
        } else {
            setStep(3);
            setTimeout(() => router.push('/marketplace'), 2000);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50/50">
            <div className="container mx-auto px-6">
                <div className="max-w-2xl mx-auto">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-bold">
                        <ChevronLeft className="w-5 h-5" />
                        العودة للوحة التحكم
                    </Link>

                    <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        {/* Stepper Progress */}
                        <div className="flex gap-2 mb-12">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-emerald-600' : 'bg-slate-100'}`} />
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 mb-2">ماذا تريد أن تبيع؟</h1>
                                        <p className="text-slate-500 font-medium">اختر العملة التي تريد عرضها للبيع في السوق.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-700">المنصة</label>
                                        <select
                                            value={platform}
                                            onChange={(e) => {
                                                const p = PLATFORMS.find(plat => plat.id === e.target.value);
                                                setPlatform(e.target.value);
                                                if (p && p.currencies.length === 1) setCurrency(p.currencies[0]);
                                                else setCurrency('');
                                            }}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-bold"
                                        >
                                            <option value="">اختر المنصة</option>
                                            {PLATFORMS.map((p) => (
                                                <option key={p.id} value={p.id}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {platform && (
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-700">اختر العملة</label>
                                            <div className="flex gap-2">
                                                {PLATFORMS.find(p => p.id === platform)?.currencies.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setCurrency(c)}
                                                        className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${currency === c ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-500'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={!currency}
                                        onClick={() => setStep(2)}
                                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                                    >
                                        المتابعة للخطوة التالية
                                        <ArrowRight className="w-5 h-5 ltr-flip group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 mb-2">تحديد السعر والكمية</h1>
                                        <p className="text-slate-500 font-medium">أدخل المبلغ المتوفر وسعر الصرف لكل 1 DZD.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 mr-2">المبلغ المتوفر</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="مثال: 500"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-6 pl-16 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-black text-xl"
                                                />
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase">{currency}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 mr-2">سعر الصرف (مقابل الدينار)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={rate}
                                                    onChange={(e) => setRate(e.target.value)}
                                                    placeholder="مثال: 245"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-6 pl-16 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-black text-xl"
                                                />
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">DA</span>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
                                            <div className="flex justify-between items-center text-sm font-bold text-emerald-800">
                                                <span>ستستقبل إجمالاً:</span>
                                                <span className="text-xl font-black">{(Number(amount || '0') * Number(rate || '0')).toLocaleString()} DA</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="px-8 py-5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black transition-all"
                                        >
                                            رجوع
                                        </button>
                                        <button
                                            disabled={!amount || !rate || loading}
                                            onClick={handleCreate}
                                            className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                                        >
                                            {loading ? 'جاري النشر...' : 'نشر العرض الآن'}
                                            {!loading && <CheckCircle2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12 space-y-8"
                                >
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 mb-4">تم النشر بنجاح!</h1>
                                        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                                            عرضك الآن متاح في السوق. سيصلك إشعار فور قيام أي متداول بفتح طلب معك.
                                        </p>
                                    </div>
                                    <div className="animate-pulse flex items-center justify-center gap-2 text-emerald-600 font-bold">
                                        <span>جاري توجيهك للماركت بليس...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .ltr-flip {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}
