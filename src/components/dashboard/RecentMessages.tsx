'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    trade_id: string;
    sender: {
        full_name: string;
    };
}

export const RecentMessages = () => {
    if (!supabase) return null;
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecentMessages();
    }, []);

    const fetchRecentMessages = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user's trades
            const { data: trades } = await supabase
                .from('trades')
                .select('id')
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

            const tradeIds = trades?.map(t => t.id) || [];

            if (tradeIds.length === 0) {
                setIsLoading(false);
                return;
            }

            // Get recent messages from those trades
            const { data } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(full_name)
                `)
                .in('trade_id', tradeIds)
                .neq('sender_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setMessages(data as any || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="animate-pulse space-y-4">
                    <div className="w-32 h-6 bg-slate-200 rounded" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                            <div className="w-24 h-4 bg-slate-200 rounded" />
                            <div className="w-full h-3 bg-slate-200 rounded" />
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
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">رسائل حديثة</h3>
                {messages.length > 0 && (
                    <div className="px-3 py-1 bg-blue-50 rounded-full">
                        <span className="text-xs font-black text-blue-600">{messages.length} جديد</span>
                    </div>
                )}
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium">لا توجد رسائل جديدة</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map((message, index) => (
                        <Link key={message.id} href={`/trade/${message.trade_id}`}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, x: -5 }}
                                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-all group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-black text-blue-600">
                                                {(message.sender as any)?.full_name?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">
                                            {(message.sender as any)?.full_name || 'Unknown'}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" style={{ transform: 'scaleX(-1)' }} />
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2 mb-2">{message.content}</p>
                                <div className="text-xs text-slate-400 font-medium">
                                    {new Date(message.created_at).toLocaleString('ar', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
