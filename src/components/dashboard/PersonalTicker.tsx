'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface TickerData {
    totalValue: number;
    activeOffers: number;
    todayVolume: number;
    changePercent: number;
}

export const PersonalTicker = () => {
    const [data, setData] = useState<TickerData>({
        totalValue: 0,
        activeOffers: 0,
        todayVolume: 0,
        changePercent: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTickerData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchTickerData, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchTickerData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch active offers
            const { data: offers } = await supabase
                .from('offers')
                .select('stock, rate')
                .eq('user_id', user.id)
                .eq('is_active', true);

            // Calculate total value
            const totalValue = offers?.reduce((sum, offer) => sum + (offer.stock * offer.rate), 0) || 0;
            const activeOffers = offers?.length || 0;

            // Fetch today's trades
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: trades } = await supabase
                .from('trades')
                .select('amount_dzd')
                .eq('seller_id', user.id)
                .eq('status', 'Completed')
                .gte('created_at', today.toISOString());

            const todayVolume = trades?.reduce((sum, trade) => sum + (Number((trade as any).amount_dzd) || 0), 0) || 0;

            setData({
                totalValue,
                activeOffers,
                todayVolume,
                changePercent: 2.5, // Mock data - calculate from historical
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching ticker data:', error);
            setIsLoading(false);
        }
    };

    const tickerItems = [
        {
            icon: DollarSign,
            label: 'قيمة العروض النشطة',
            value: `${data.totalValue.toFixed(2)} وحدة`,
            color: 'emerald',
        },
        {
            icon: Package,
            label: 'عروض نشطة',
            value: data.activeOffers.toString(),
            color: 'blue',
        },
        {
            icon: TrendingUp,
            label: 'حجم اليوم',
            value: `${data.todayVolume.toFixed(2)} وحدة`,
            color: 'purple',
        },
        {
            icon: Activity,
            label: 'التغيير',
            value: `+${data.changePercent}%`,
            color: 'green',
        },
    ];

    if (isLoading) {
        return (
            <div className="w-full bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-slate-200 p-6">
                <div className="flex items-center gap-8 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
                            <div>
                                <div className="w-24 h-3 bg-slate-200 rounded mb-2" />
                                <div className="w-16 h-4 bg-slate-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border-b border-slate-200 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-6">
                <div className="flex items-center justify-between gap-8 overflow-x-auto scrollbar-hide">
                    {tickerItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 min-w-fit"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-100 flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 text-${item.color}-600`} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium mb-1">{item.label}</div>
                                    <div className="text-xl font-black text-slate-900">{item.value}</div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Live Indicator */}
                    <div className="flex items-center gap-2 min-w-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs text-slate-500 font-bold">تحديث مباشر</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
