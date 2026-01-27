'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface Trade {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    listing: {
        currency: string;
    };
    buyer: {
        full_name: string;
    };
    seller: {
        full_name: string;
    };
}

export const ActiveTrades = () => {
    if (!supabase) return null;
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchActiveTrades();

        // Real-time subscription
        const setupSubscription = async () => {
            const channel = supabase
                .channel('active-trades')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'trades',
                }, () => {
                    fetchActiveTrades();
                })
                .subscribe();

            return channel;
        };

        const channelPromise = setupSubscription();

        return () => {
            channelPromise.then(channel => {
                supabase.removeChannel(channel);
            });
        };
    }, []);

    const fetchActiveTrades = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('trades')
                .select(`
                    *,
                    listing:listing_id(currency),
                    buyer:buyer_id(full_name),
                    seller:seller_id(full_name)
                `)
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .in('status', ['Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease'])
                .order('created_at', { ascending: false })
                .limit(5);

            setTrades(data as any || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching active trades:', error);
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending':
            case 'AwaitingPayment':
                return <Clock className="w-4 h-4 text-amber-600" />;
            case 'Paid':
            case 'AwaitingRelease':
                return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'Pending': 'قيد الانتظار',
            'AwaitingPayment': 'انتظار الدفع',
            'Paid': 'تم الدفع',
            'AwaitingRelease': 'انتظار التأكيد',
        };
        return labels[status] || status;
    };

    if (isLoading) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="animate-pulse space-y-4">
                    <div className="w-32 h-6 bg-slate-200 rounded" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                            <div className="w-24 h-4 bg-slate-200 rounded" />
                            <div className="w-32 h-3 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">التداولات النشطة</h3>
                <div className="px-3 py-1 bg-emerald-50 rounded-full">
                    <span className="text-xs font-black text-emerald-600">{trades.length} نشط</span>
                </div>
            </div>

            {trades.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium">لا توجد تداولات نشطة حالياً</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {trades.map((trade, index) => (
                        <Link key={trade.id} href={`/trade/${trade.id}`}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, x: -5 }}
                                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-all group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(trade.status)}
                                        <span className="text-xs font-bold text-slate-600">{getStatusLabel(trade.status)}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" style={{ transform: 'scaleX(-1)' }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{trade.amount} DZD</div>
                                        <div className="text-xs text-slate-500 font-medium">{(trade.listing as any)?.currency || 'N/A'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 font-medium">
                                            {new Date(trade.created_at).toLocaleDateString('ar')}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
