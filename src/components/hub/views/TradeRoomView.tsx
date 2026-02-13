'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Paperclip, AlertTriangle, MessageSquare, Info, MessageCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { StatusStepper } from '@/components/trade/StatusStepper';
import { Message } from '@/types';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ReceiptUploader } from '@/components/trade/ReceiptUploader';
import { DisputeModal } from '@/components/trade/DisputeModal';

interface TradeRoomViewProps {
    tradeId: string;
    onBack: () => void;
}

export const TradeRoomView = ({ tradeId, onBack }: TradeRoomViewProps) => {
    const [trade, setTrade] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sellerPaymentMethods, setSellerPaymentMethods] = useState<any[]>([]);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

    // New state for mobile tabs
    const [activeTab, setActiveTab] = useState<'details' | 'chat'>('chat');

    useEffect(() => {
        fetchTradeData();
        fetchMessages();

        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
            setCurrentUserId(user?.id || null);
        });

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
                    const newMsg = payload.new as Message;
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

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
            messageChannel.unsubscribe();
            tradeChannel.unsubscribe();
        };
    }, [tradeId]);

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

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
            `)
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

        const { error, status } = await supabase
            .from('messages')
            .insert(payload)
            .select('id');

        if (status === 201) {
            setNewMessage('');
        }
    };

    const handleCancelTrade = async () => {
        if (!confirm('هل أنت متأكد من إلغاء هذا التداول؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            const { error } = await supabase.from('trades').update({ status: 'Cancelled' }).eq('id', tradeId);
            if (error) throw error;
            await sendMessage('تم إلغاء التداول من قبل أحد الأطراف.');
        } catch (error: any) {
            alert('حدث خطأ أثناء إلغاء التداول: ' + error.message);
        }
    };

    const fetchSellerPaymentMethods = async () => {
        if (!trade?.seller_id) return;
        const { data } = await supabase.from('payment_methods').select('provider, account_identifier').eq('user_id', trade.seller_id);
        setSellerPaymentMethods(data || []);
    };

    const handleSendPaymentInfo = async () => {
        let methods = sellerPaymentMethods;
        if (methods.length === 0) {
            if (!trade?.seller_id) return;
            const { data } = await supabase.from('payment_methods').select('provider, account_identifier').eq('user_id', trade.seller_id);
            methods = data || [];
            setSellerPaymentMethods(methods);
        }

        let content = '';
        if (methods.length > 0) {
            const method = methods[0];
            content = `يرجى الدفع عبر ${method.provider}: ${method.account_identifier}`;
        } else {
            const userConfirmed = confirm('لم يتم العثور على طرق دفع محفوظة في حسابك. يمكنك إضافتها في الإعدادات.\n\nهل تريد إرسال رسالة تطلب من المشتري الانتظار قليلاً؟');
            if (userConfirmed) {
                content = 'مرحباً، سأقوم بتزويدك بمعلومات الدفع في لحظات.';
            } else {
                return;
            }
        }

        if (!currentUserId) return;
        await supabase.from('messages').insert({
            trade_id: tradeId,
            sender_id: currentUserId,
            content: content,
            type: 'payment_info'
        });
        await supabase.from('trades').update({ status: 'AwaitingPayment' }).eq('id', tradeId);
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
            case 'AwaitingPayment': return 1;
            case 'Paid': return 2;
            case 'AwaitingRelease':
            case 'Completed': return 3;
            default: return 1;
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 top-20 bg-slate-50 flex items-center justify-center z-0">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // Components for cleaner render structure
    const DetailsPanel = () => (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
                <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-black text-slate-900">تفاصيل التداول</h2>
                <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="mb-6 bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center shadow-sm">
                    <p className="text-sm text-emerald-600 font-bold mb-1">مبلغ التداول</p>
                    <p className="text-3xl font-black text-emerald-700 dir-ltr">{trade?.amount_dzd} DZD</p>
                    <p className="text-xs text-emerald-500 font-bold mt-1">
                        مقابل {(trade?.offer as any)?.currency_code}
                    </p>
                </div>

                <StatusStepper currentStep={getCurrentStep()} />

                {trade?.status === 'Cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 my-4 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-bold text-sm">تم إلغاء هذا التداول.</p>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    {currentUserId === trade?.seller_id && trade?.status === 'Pending' && (
                        <button
                            onClick={() => { fetchSellerPaymentMethods().then(() => handleSendPaymentInfo()); }}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            إرسال معلومات الدفع
                        </button>
                    )}

                    {currentUserId === trade?.seller_id && (trade?.status === 'Pending' || trade?.status === 'AwaitingPayment') && (
                        <button
                            onClick={handleSendPaymentInfo}
                            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                        >
                            تحديث معلومات الدفع
                        </button>
                    )}

                    {currentUserId === trade?.buyer_id && (trade?.status === 'AwaitingPayment' || trade?.status === 'Pending') && (
                        <div className="w-full">
                            <ReceiptUploader
                                tradeId={tradeId}
                                onUploadComplete={(url) => { sendMessage(`تم إرفاق إيصال الدفع: ${url}`); }}
                            />
                        </div>
                    )}

                    {currentUserId === trade?.seller_id && trade?.status === 'Paid' && (
                        <button
                            onClick={async () => {
                                if (confirm('هل أنت متأكد من استلام المبلغ؟ سيتم تحرير الأصول للبائع.')) {
                                    await supabase.from('trades').update({ status: 'Completed' }).eq('id', tradeId);
                                }
                            }}
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                        >
                            تأكيد الاستلام وتحرير الأصول
                        </button>
                    )}

                    {(trade?.status === 'Pending' || trade?.status === 'AwaitingPayment') && (
                        <button
                            onClick={handleCancelTrade}
                            className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors text-sm"
                        >
                            إلغاء التداول
                        </button>
                    )}

                    <button
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="w-full py-3 mt-2 rounded-xl border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        إبلاغ عن مشكلة
                    </button>
                </div>
            </div>
        </div>
    );

    const ChatPanel = () => (
        <div className="h-full flex flex-col bg-slate-50 relative">
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="lg:hidden">
                        <UserAvatar
                            avatarUrl={currentUserId === trade?.buyer_id
                                ? (trade?.seller as any)?.avatar_url
                                : (trade?.buyer as any)?.avatar_url}
                            username={currentUserId === trade?.buyer_id
                                ? (trade?.seller as any)?.username
                                : (trade?.buyer as any)?.username}
                            size="sm"
                        />
                    </div>
                    <div className="hidden lg:block">
                        <UserAvatar
                            avatarUrl={currentUserId === trade?.buyer_id
                                ? (trade?.seller as any)?.avatar_url
                                : (trade?.buyer as any)?.avatar_url}
                            username={currentUserId === trade?.buyer_id
                                ? (trade?.seller as any)?.username
                                : (trade?.buyer as any)?.username}
                            size="md"
                        />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">
                            {currentUserId === trade?.buyer_id
                                ? (trade?.seller as any)?.username
                                : (trade?.buyer as any)?.username}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-500 font-bold">متصل الآن</span>
                        </div>
                    </div>
                </div>
                {/* Mobile Back Button in Chat Header if tabs weren't enough, but tabs are better */}
                <button onClick={onBack} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                    <ArrowLeft className="w-5 h-5 transform rotate-180" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                        <MessageSquare className="w-12 h-12 mb-2" />
                        <p className="font-bold">لا توجد رسائل بعد</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.sender_id === currentUserId;
                        return (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] sm:max-w-[70%] px-5 py-3 shadow-sm
                                        ${isOwn
                                            ? 'bg-emerald-600 text-white rounded-2xl rounded-br-none'
                                            : 'bg-white text-slate-800 rounded-2xl rounded-bl-none border border-slate-100'
                                        }
                                    `}
                                >
                                    <p className="font-medium text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-[10px] mt-1.5 opacity-70 font-medium text-left dir-ltr`}>
                                        {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0 safe-area-bottom">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <Paperclip className="w-6 h-6" />
                    </button>
                    <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-emerald-500/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="اكتب رسالتك..."
                            disabled={trade?.status === 'Cancelled'}
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 resize-none max-h-32 py-2"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || trade?.status === 'Cancelled'}
                        className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 top-[73px] bg-slate-50 z-40 dir-rtl safe-area-bottom">
            {/* Desktop Layout (Split View) */}
            <div className="hidden lg:flex w-full h-full overflow-hidden">
                <div className="w-96 bg-white border-l border-slate-200 h-full overflow-hidden flex-shrink-0 z-10 shadow-sm relative">
                    {/* Header for Desktop Sidebar */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <h2 className="font-black text-slate-900">غرفة التداول</h2>
                            <span className="text-xs font-bold text-slate-400">#{tradeId.slice(0, 8)}</span>
                        </div>
                        <div className="w-9" />
                    </div>
                    <DetailsPanel /> {/* Reusing the panel content logic, slightly modified structure inside */}
                </div>
                <div className="flex-1 h-full relative">
                    <ChatPanel />
                </div>
            </div>

            {/* Mobile Layout (Tabs) */}
            <div className="lg:hidden flex flex-col h-full w-full">
                {/* Mobile Tab Bar */}
                <div className="h-14 bg-white border-b border-slate-200 flex flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 flex items-center justify-center gap-2 font-bold transition-all relative ${activeTab === 'chat' ? 'text-emerald-600' : 'text-slate-500'
                            }`}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>المحادثة</span>
                        {activeTab === 'chat' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                        )}
                    </button>
                    <div className="w-[1px] bg-slate-100 my-3" />
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 flex items-center justify-center gap-2 font-bold transition-all relative ${activeTab === 'details' ? 'text-emerald-600' : 'text-slate-500'
                            }`}
                    >
                        <Info className="w-5 h-5" />
                        <span>التفاصيل</span>
                        {activeTab === 'details' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                        )}
                    </button>
                </div>

                {/* Mobile Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'chat' ? (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full w-full"
                            >
                                <ChatPanel />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full w-full bg-white"
                            >
                                <DetailsPanel />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <DisputeModal
                isOpen={isDisputeModalOpen}
                onClose={() => setIsDisputeModalOpen(false)}
                tradeId={tradeId}
            />
        </div>
    );
};
