'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Paperclip, User } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { StatusStepper } from '@/components/trade/StatusStepper';
import { Message } from '@/types';
import { UserAvatar } from '@/components/common/UserAvatar';

interface TradeRoomViewProps {
    tradeId: string;
    onBack: () => void;
}

export const TradeRoomView = ({ tradeId, onBack }: TradeRoomViewProps) => {
    if (!supabase) return null;
    const [trade, setTrade] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTradeData();
        fetchMessages();

        // Get current user
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
            setCurrentUserId(user?.id || null);
        });

        // Real-time message subscription
        const messageChannel = supabase
            .channel(`trade-messages-${tradeId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `trade_id=eq.${tradeId}`,
                },
                (payload: any) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        // Real-time trade status subscription
        const tradeChannel = supabase
            .channel(`trade-status-${tradeId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'trades',
                    filter: `id=eq.${tradeId}`,
                },
                (payload: any) => {
                    setTrade((prev: any) => ({ ...prev, ...payload.new }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(tradeChannel);
        };
    }, [tradeId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTradeData = async () => {
        const { data } = await supabase
            .from('trades')
            .select(`
                *,
                offer:offer_id(currency_code, rate),
                buyer:buyer_id(username, avatar_url),
                seller:seller_id(username, avatar_url)
            `) // Fixed: Fixed join to use offer_id and currency_code
            .eq('id', tradeId)
            .single();

        setTrade(data);
        setIsLoading(false);
    };

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('trade_id', tradeId)
            .order('created_at', { ascending: true });

        setMessages(data || []);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUserId) return;

        const payload = {
            trade_id: tradeId,
            sender_id: currentUserId,
            content: newMessage.trim(),
        };

        console.log('Sending message hub payload:', payload);

        // UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(payload.trade_id)) {
            console.error('Invalid trade_id in HubView:', payload.trade_id);
            return;
        }

        const { error, status } = await supabase
            .from('messages')
            .insert(payload)
            .select('id, trade_id, sender_id, content, created_at');

        if (error) {
            console.error('Error sending message from HubView:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        } else if (status === 201) {
            setNewMessage('');
        }
    };

    const handleSendPaymentInfo = async () => {
        // For now, we just send a message. In future, we can have a dedicated structured data.
        const infoMessage = `
**معلومات الدفع:**
يرجى إرسال المبلغ إلى الحساب التالي.
(يمكن للبائع إرفاق تفاصيل الحساب هنا)
        `;

        await sendMessage(infoMessage);

        // Update status to AwaitingPayment
        await supabase.from('trades').update({ status: 'AwaitingPayment' }).eq('id', tradeId);
    };

    const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsConfirmingPayment(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `receipts/${tradeId}-${Date.now()}.${fileExt}`;

        try {
            // Upload
            const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath);

            // Send receipt as message
            await sendMessage(`تم إرفاق إيصال الدفع: ${publicUrl}`);

            // Update status
            await supabase.from('trades').update({ status: 'Paid' }).eq('id', tradeId);

        } catch (error) {
            console.error('Error uploading receipt:', error);
            alert('فشل رفع الإيصال');
        } finally {
            setIsConfirmingPayment(false);
        }
    };

    const sendMessage = async (content: string) => {
        if (!currentUserId) return;
        await supabase.from('messages').insert({
            trade_id: tradeId,
            sender_id: currentUserId,
            content: content.trim(),
        });
    }

    const getCurrentStep = () => {
        if (!trade) return 1;
        switch (trade.status) {
            case 'Pending':
            case 'AwaitingPayment':
                return 1;
            case 'Paid':
                return 2;
            case 'AwaitingRelease':
            case 'Completed':
                return 3;
            default:
                return 1;
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with Back Button */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    العودة إلى التداولات
                </button>
                <h2 className="text-4xl font-black text-slate-900 mb-2">غرفة التداول</h2>
                <p className="text-slate-500 font-medium">
                    تداول {trade?.amount_dzd} DZD من {(trade?.offer as any)?.currency_code}
                </p>
            </div>

            {/* Split View Container */}
            <div className="flex-1 flex flex-col gap-6 min-h-0">
                {/* Top Section: Status Stepper (40%) */}
                <div className="flex-shrink-0">
                    <StatusStepper currentStep={getCurrentStep()} />

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mb-4">
                        {currentUserId === trade?.seller_id && trade?.status === 'Pending' && (
                            <button
                                onClick={handleSendPaymentInfo}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                            >
                                إرسال معلومات الدفع
                            </button>
                        )}
                        {currentUserId === trade?.seller_id && (trade?.status === 'Pending' || trade?.status === 'AwaitingPayment') && (
                            <button
                                onClick={handleSendPaymentInfo} // Re-send if needed
                                className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                            >
                                تحديث معلومات الدفع
                            </button>
                        )}

                        {currentUserId === trade?.buyer_id && (trade?.status === 'AwaitingPayment' || trade?.status === 'Pending') && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUploadReceipt}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isConfirmingPayment}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                                >
                                    {isConfirmingPayment ? 'جاري الرفع...' : 'تأكيد الدفع (رفع إيصال)'}
                                </button>
                            </>
                        )}

                        {currentUserId === trade?.seller_id && trade?.status === 'Paid' && (
                            <button
                                onClick={async () => {
                                    if (confirm('هل أنت متأكد من استلام المبلغ؟ سيتم تحرير الأصول للبائع.')) {
                                        await supabase.from('trades').update({ status: 'Completed' }).eq('id', tradeId);
                                    }
                                }}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                            >
                                تأكيد الاستلام وتحرير الأصول
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Chat (60%) */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-0">
                    {/* Chat Header */}
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <UserAvatar
                                avatarUrl={currentUserId === trade?.buyer_id
                                    ? (trade?.seller as any)?.avatar_url
                                    : (trade?.buyer as any)?.avatar_url}
                                username={currentUserId === trade?.buyer_id
                                    ? (trade?.seller as any)?.username
                                    : (trade?.buyer as any)?.username}
                                size="md"
                            />
                            <div>
                                <div className="font-black text-slate-900">
                                    {currentUserId === trade?.buyer_id
                                        ? (trade?.seller as any)?.username
                                        : (trade?.buyer as any)?.username}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">متصل</div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-400 font-medium">ابدأ المحادثة الآن</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const isOwn = message.sender_id === currentUserId;
                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`
                        max-w-[70%] px-5 py-3 rounded-3xl
                        ${isOwn
                                                    ? 'bg-emerald-500 text-white rounded-br-md'
                                                    : 'bg-slate-100 text-slate-900 rounded-bl-md'
                                                }
                      `}
                                        >
                                            <p className="font-medium text-sm leading-relaxed">{message.content}</p>
                                            <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                {new Date(message.created_at).toLocaleTimeString('ar', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-slate-200">
                        <div className="flex gap-3">
                            <button className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <Paperclip className="w-5 h-5 text-slate-600" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="اكتب رسالتك..."
                                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
