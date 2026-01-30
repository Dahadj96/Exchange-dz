'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Profile } from '@/types';

interface HubContextPanelProps {
    userId: string;
}

export const HubContextPanel = ({ userId }: HubContextPanelProps) => {
    if (!supabase) return null;
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTrades, setActiveTrades] = useState(0);

    useEffect(() => {
        fetchProfile();
        fetchActiveTrades();
    }, [userId]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setProfile(data);
        }
    };

    const fetchActiveTrades = async () => {
        const { data } = await supabase
            .from('trades')
            .select('id')
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .in('status', ['Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease']);

        setActiveTrades(data?.length || 0);
    };

    if (!profile) {
        return (
            <div className="w-full h-full bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4" />
                <div className="w-32 h-4 bg-slate-200 rounded mx-auto mb-2" />
                <div className="w-24 h-3 bg-slate-200 rounded mx-auto" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Profile Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
                <div className="text-center">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-emerald-600/20">
                            {profile.full_name.charAt(0)}
                        </div>
                        {profile.is_verified && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                <BadgeCheck className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-black text-slate-900 mb-1">{profile.full_name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">
                        عضو منذ {new Date(profile.created_at).toLocaleDateString('ar')}
                    </p>

                    {/* Reputation */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500 font-medium">نسبة السمعة</span>
                            <span className="text-lg font-black text-emerald-600">{profile.success_rate}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${profile.success_rate}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    إحصائيات سريعة
                </h4>

                <div className="space-y-4">
                    {/* Total Trades */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                        <span className="text-xs text-slate-600 font-medium">إجمالي التداولات</span>
                        <span className="text-lg font-black text-slate-900">{profile.total_trades}</span>
                    </div>

                    {/* Active Trades */}
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                        <span className="text-xs text-emerald-700 font-medium">تداولات نشطة</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-emerald-600">{activeTrades}</span>
                            {activeTrades > 0 && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            )}
                        </div>
                    </div>

                    {/* Success Rate Badge */}
                    <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-slate-900">
                            معدل نجاح {profile.success_rate}%
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
