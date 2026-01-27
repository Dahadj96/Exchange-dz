'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface NotificationData {
    hasNewMessages: boolean;
    hasNewReceipts: boolean;
    totalCount: number;
}

export const useNotifications = (userId: string | null) => {
    if (!supabase) return { hasNewMessages: false, hasNewReceipts: false, totalCount: 0, clearNotifications: () => { } };
    const [notifications, setNotifications] = useState<NotificationData>({
        hasNewMessages: false,
        hasNewReceipts: false,
        totalCount: 0,
    });

    useEffect(() => {
        if (!userId) return;

        // Subscribe to new messages
        const messagesChannel = supabase
            .channel('new-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=neq.${userId}`,
                },
                async (payload) => {
                    // Check if the message is for a trade the user is involved in
                    const { data: trade } = await supabase
                        .from('trades')
                        .select('buyer_id, seller_id')
                        .eq('id', (payload.new as any).trade_id)
                        .single();

                    if (trade && (trade.buyer_id === userId || trade.seller_id === userId)) {
                        setNotifications(prev => ({
                            ...prev,
                            hasNewMessages: true,
                            totalCount: prev.totalCount + 1,
                        }));
                    }
                }
            )
            .subscribe();

        // Subscribe to receipt uploads
        const receiptsChannel = supabase
            .channel('new-receipts')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'trades',
                    filter: `receipt_url=not.is.null`,
                },
                async (payload) => {
                    const trade = payload.new as any;
                    if (trade.buyer_id === userId || trade.seller_id === userId) {
                        setNotifications(prev => ({
                            ...prev,
                            hasNewReceipts: true,
                            totalCount: prev.totalCount + 1,
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(receiptsChannel);
        };
    }, [userId]);

    const clearNotifications = () => {
        setNotifications({
            hasNewMessages: false,
            hasNewReceipts: false,
            totalCount: 0,
        });
    };

    return {
        ...notifications,
        clearNotifications,
    };
};
