'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Stats {
    totalTrades: number;
    successRate: number;
    totalVolume: number;
    trustScore: number;
}

export const StatsCard = () => {
    if (!supabase) return null;
    const [stats, setStats] = useState<Stats>({
        totalTrades: 0,
        successRate: 0,
        totalVolume: 0,
        trustScore: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('success_rate, total_trades')
                .eq('id', user.id)
                .single();

            // Fetch completed trades for volume
            const { data: trades } = await supabase
                .from('trades')
                .select('amount_dzd')
                .eq('seller_id', user.id)
                .eq('status', 'Completed');

            const totalVolume = trades?.reduce((sum, trade) => sum + (trade.amount_dzd || 0), 0) || 0;

            setStats({
                totalTrades: profile?.total_trades || 0,
                successRate: profile?.success_rate || 0,
                totalVolume,
                trustScore: profile?.success_rate || 0,
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setIsLoading(false);
        }
    };

    const statItems = [
        {
            icon: Users,
            label: 'إجمالي التداولات',
            value: stats.totalTrades.toString(),
            color: 'blue',
        },
        {
            icon: TrendingUp,
            label: 'معدل النجاح',
            value: `${stats.successRate}%`,
            color: 'emerald',
        },
        {
            icon: DollarSign,
            label: 'الحجم الكلي',
            value: `${stats.totalVolume.toFixed(2)} DZD`,
            color: 'purple',
        },
        {
            icon: Award,
            label: 'نقاط الثقة',
            value: stats.trustScore.toString(),
            color: 'amber',
        },
    ];

    if (isLoading) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="animate-pulse space-y-6">
                    <div className="w-32 h-6 bg-slate-200 rounded" />
                    <div className="grid grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
                                <div className="w-20 h-4 bg-slate-200 rounded" />
                                <div className="w-16 h-6 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
        >
            <h3 className="text-xl font-black text-slate-900 mb-6">إحصائياتي</h3>

            <div className="grid grid-cols-2 gap-6">
                {statItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-3"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 text-${item.color}-600`} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-medium mb-1">{item.label}</div>
                                <div className="text-2xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
