'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export const TrustScore = () => {
    if (!supabase) return null;
    const [score, setScore] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTrustScore();
    }, []);

    const fetchTrustScore = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('success_rate, is_verified')
                .eq('id', user.id)
                .single();

            setScore(profile?.success_rate || 0);
            setIsVerified(profile?.is_verified || false);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching trust score:', error);
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 95) return 'emerald';
        if (score >= 85) return 'blue';
        if (score >= 70) return 'amber';
        return 'red';
    };

    const color = getScoreColor(score);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    if (isLoading) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="animate-pulse space-y-4">
                    <div className="w-32 h-6 bg-slate-200 rounded" />
                    <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
        >
            <h3 className="text-xl font-black text-slate-900 mb-6">نقاط الثقة</h3>

            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`text-${color}-500`}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className={`text-3xl font-black text-${color}-600`}>{score}%</div>
                    </div>
                </div>
            </div>

            {/* Verification Badge */}
            {isVerified && (
                <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-emerald-50 rounded-2xl">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-700">حساب موثق</span>
                </div>
            )}

            {/* Stats */}
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-slate-600">الأداء</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">ممتاز</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium text-slate-600">التقييمات</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">4.9/5</span>
                </div>
            </div>
        </motion.div>
    );
};
