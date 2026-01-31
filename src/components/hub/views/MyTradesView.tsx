'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Trade } from '@/types';
import { useRouter } from 'next/navigation';

interface MyTradesViewProps {
    onTradeClick: (tradeId: string) => void;
}

export const MyTradesView = ({ onTradeClick }: MyTradesViewProps) => {
    if (!supabase) return null;
    const router = useRouter();
    const [trades, setTrades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchTrades();

        // Real-time subscription
        const channel = supabase
            .channel('my-trades')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'trades',
            }, () => {
                fetchTrades();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTrades = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('trades')
                .select(`
                  *,
                  offer:offer_id(currency_code),
                  buyer:buyer_id(username),
                  seller:seller_id(username)
                `) // Fixed: Points to offer join after FK rename
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            setTrades(data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching trades:', error);
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending':
            case 'AwaitingPayment':
                return <Clock className="w-5 h-5 text-amber-600" />;
            case 'Paid':
            case 'AwaitingRelease':
                return <CheckCircle className="w-5 h-5 text-blue-600" />;
            case 'Completed':
                return <CheckCircle className="w-5 h-5 text-emerald-600" />;
            case 'Disputed':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'Pending': 'قيد الانتظار',
            'AwaitingPayment': 'انتظار الدفع',
            'Paid': 'تم الدفع',
            'AwaitingRelease': 'انتظار التأكيد',
            'Completed': 'مكتمل',
            'Disputed': 'متنازع عليه',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
            case 'AwaitingPayment':
                return 'bg-amber-50 border-amber-200';
            case 'Paid':
            case 'AwaitingRelease':
                return 'bg-blue-50 border-blue-200';
            case 'Completed':
                return 'bg-emerald-50 border-emerald-200';
            case 'Disputed':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-slate-50 border-slate-200';
        }
    };

    const filteredTrades = filterStatus === 'all'
        ? trades
        : trades.filter(trade => {
            if (filterStatus === 'active') {
                return ['Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease'].includes(trade.status);
            }
            if (filterStatus === 'completed') {
                return trade.status === 'Completed';
            }
            return true;
        });

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 mb-2">تداولاتي</h2>
                <p className="text-slate-500 font-medium">إدارة ومتابعة جميع تداولاتك</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-8">
                {[
                    { id: 'all', label: 'الكل', count: trades.length },
                    { id: 'active', label: 'نشط', count: trades.filter(t => ['Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease'].includes(t.status)).length },
                    { id: 'completed', label: 'مكتمل', count: trades.filter(t => t.status === 'Completed').length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`
              px-6 py-3 rounded-2xl font-bold text-sm transition-all
              ${filterStatus === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                            }
            `}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Trades List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-32 h-4 bg-slate-200 rounded" />
                                <div className="w-20 h-4 bg-slate-200 rounded" />
                            </div>
                            <div className="w-full h-16 bg-slate-200 rounded-2xl" />
                        </div>
                    ))}
                </div>
            ) : filteredTrades.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">لا توجد تداولات</h3>
                        <p className="text-slate-500 font-medium">ابدأ تداولك الأول من السوق</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 pb-8">
                    {filteredTrades.map((trade, index) => (
                        <motion.div
                            key={trade.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => router.push(`/trade/${trade.id}`)}
                            whileHover={{ scale: 1.02, x: -5 }}
                            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all cursor-pointer group"
                        >
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(trade.status)}`}>
                                    {getStatusIcon(trade.status)}
                                    <span className="text-sm font-bold">{getStatusLabel(trade.status)}</span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" style={{ transform: 'scaleX(-1)' }} />
                            </div>

                            {/* Trade Info */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-black text-slate-900 mb-1">
                                        {trade.amount_asset} {(trade.offer as any)?.currency || (trade.offer as any)?.currency_code}
                                    </div>
                                    <div className="text-sm text-slate-500 font-medium">
                                        {(trade.offer as any)?.currency_code || 'N/A'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-medium mb-1">
                                        {new Date(trade.created_at).toLocaleDateString('ar')}
                                    </div>
                                    <div className="text-xs text-slate-600 font-bold">
                                        مع {(trade.buyer as any)?.username || (trade.seller as any)?.username}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
