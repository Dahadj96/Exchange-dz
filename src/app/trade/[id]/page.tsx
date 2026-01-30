'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    Image as ImageIcon,
    AlertTriangle,
    ShieldCheck,
    ChevronLeft
} from 'lucide-react';
import { Trade, Message, TradeStatus } from '@/types';
import { supabase } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ReceiptUploader } from '@/components/trade/ReceiptUploader';
import { StatusStepper } from '@/components/trade/StatusStepper';
import { DisputeModal } from '@/components/trade/DisputeModal';
import Link from 'next/link';

export default function TradeRoomPage() {
    if (!supabase) return null;
    const params = useParams();
    const router = useRouter();
    const tradeId = params.id as string;
    const [currentStep, setCurrentStep] = useState(1);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [tradeData, setTradeData] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        const fetchInitialData = async () => {
            const { data: trade } = await supabase
                .from('trades')
                .select(`
                    *,
                    offer:offers (*)
                `) // Fixed: Points to offer join after FK rename
                .eq('id', tradeId)
                .single();

            if (trade) {
                // Fetch profiles separately for clarity and to avoid complex naming issues
                const { data: seller } = await supabase.from('profiles').select('*').eq('id', trade.seller_id).single();
                const { data: buyer } = await supabase.from('profiles').select('*').eq('id', trade.buyer_id).single();

                setTradeData({
                    ...trade,
                    seller,
                    buyer
                });

                // Step mapping
                switch (trade.status) {
                    case 'Pending':
                    case 'AwaitingPayment':
                        setCurrentStep(1);
                        break;
                    case 'Paid':
                    case 'AwaitingRelease':
                        setCurrentStep(2);
                        break;
                    case 'Completed':
                        setCurrentStep(3);
                        break;
                    default:
                        setCurrentStep(1);
                }
            }

            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('trade_id', tradeId)
                .order('created_at', { ascending: true });

            if (msgs) setMessages(msgs as Message[]);
        };

        fetchUser();
        fetchInitialData();

        const channel = supabase
            .channel(`trade-${tradeId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `trade_id=eq.${tradeId}`
            }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    setMessages((prev: Message[]) => [...prev, payload.new as Message]);
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'trades',
                filter: `id=eq.${tradeId}`
            }, () => {
                fetchInitialData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tradeId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
        }
    }, [messages]);

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const payload = {
            trade_id: tradeId,
            sender_id: user.id,
            content: newMessage.trim(),
        };

        console.log('Sending message payload:', payload);

        // Basic UUID validation (regex)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(payload.trade_id)) {
            console.error('Invalid trade_id (not a UUID):', payload.trade_id);
            return;
        }

        const { data, error, status } = await supabase
            .from('messages')
            .insert(payload)
            .select('id, trade_id, sender_id, content, created_at');

        if (error) {
            console.error('Error sending message (Supabase 400?):', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        } else if (status === 201) {
            setNewMessage('');
        }
    };

    const updateTradeStatus = async (status: TradeStatus) => {
        setIsUpdating(true);
        const { error } = await supabase
            .from('trades')
            .update({ status })
            .eq('id', tradeId);

        if (!error) {
            // Send system message
            await supabase.from('messages').insert({
                trade_id: tradeId,
                sender_id: user.id,
                content: `🚀 تم تغيير حالة المعاملة إلى: ${status}`,
            }).select('id, trade_id, sender_id, content, created_at');
        }
        setIsUpdating(false);
    };

    const isBuyer = user?.id === tradeData?.buyer_id;
    const isSeller = user?.id === tradeData?.seller_id;

    if (!tradeData) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
    );

    return (
        <div className="min-h-screen pt-32 bg-white flex flex-col lg:flex-row">
            {/* Left Side: Trade Details */}
            <aside className="w-full lg:w-[480px] border-l border-slate-200 p-8 lg:p-10 space-y-8 overflow-y-auto bg-slate-50/50">
                <Link href="/dashboard" className="flex items-center gap-4 text-slate-400 mb-6 cursor-pointer hover:text-slate-900 transition-colors bg-white w-fit px-5 py-3 rounded-3xl border border-slate-200 shadow-sm">
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                    <span className="text-sm font-bold">العودة للوحة التحكم</span>
                </Link>

                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-3 leading-tight font-cairo">غرفة التحويل #{tradeId.slice(0, 6)}</h1>
                    <div className="flex items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${tradeData.status === 'Completed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}>
                            {tradeData.status}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">عملية {tradeData.offer?.platform}</span>
                    </div>
                </div>

                <StatusStepper currentStep={currentStep} />

                {/* Secure Payment Info - Visible ONLY to Buyer when AwaitingPayment or later */}
                {isBuyer && (tradeData.status === 'AwaitingPayment' || tradeData.status === 'Pending') && (
                    <div className="p-8 rounded-3xl bg-emerald-600 text-white space-y-4 shadow-xl shadow-emerald-600/20">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-6 h-6" />
                            <h3 className="text-lg font-black">معلومات الدفع الآمنة</h3>
                        </div>
                        <p className="text-emerald-100 text-sm font-medium">قم بتحويل المبلغ إلى الحساب التالي:</p>
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/20">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">الحساب / الإيميل</span>
                            </div>
                            <div className="text-xl font-black break-all">{tradeData.payment_details?.details || 'في انتظار البائع...'}</div>
                        </div>
                        <div className="text-[10px] text-emerald-200 font-bold leading-relaxed">
                            ⚠️ لا تقم بالتحويل خارج هذه البيانات لضمان حقك في النزاع.
                        </div>
                    </div>
                )}

                <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900">ملخص الصفقة</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 font-bold">المبلغ المطلوب:</span>
                            <span className="text-slate-900 font-black text-2xl tracking-tight">{tradeData.amount_dzd.toLocaleString()} DZD</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 font-bold">ستستلم:</span>
                            <span className="text-emerald-600 font-black text-2xl tracking-tight">{tradeData.amount_asset} {tradeData.offer?.currency_code}</span>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-semibold">السعر المتفق عليه:</span>
                            <span className="text-slate-900 font-bold">{tradeData.offer?.rate} DZD</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsDisputeModalOpen(true)}
                    className="w-full py-5 rounded-3xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all text-sm font-black flex items-center justify-center gap-2 shadow-sm font-cairo"
                >
                    <AlertTriangle className="w-5 h-5" />
                    تحذير أو نزاع
                </button>
            </aside>

            {/* Right Side: Chat */}
            <main className="flex-1 flex flex-col h-[calc(100vh-8rem)] bg-white relative">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <ShieldCheck className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-slate-900 font-black text-xl font-cairo">الدردشة الآمنة</h2>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">تواصل مع {isBuyer ? 'البائع' : 'المشتري'} بأمان.</p>
                        </div>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        const isSystem = msg.content.includes('🚀');
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center my-4' : ''}`}>
                                {isSystem ? (
                                    <div className="px-6 py-2 bg-slate-900/5 border border-slate-900/10 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className={`max-w-[70%] p-6 rounded-3xl shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                                        <div className={`text-[9px] mt-2 font-black uppercase ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Input & Key Actions */}
                <div className="p-8 border-t border-slate-100 bg-white">
                    {/* Buyer: Mark as Paid */}
                    {isBuyer && tradeData.status === 'Pending' && (
                        <div className="mb-8 p-8 border-2 border-dashed border-emerald-200 rounded-[40px] bg-emerald-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-right">
                                <h3 className="text-xl font-black text-emerald-900 mb-2 font-cairo">هل أتممت عملية التحويل؟</h3>
                                <p className="text-emerald-700 font-medium">يُرجى رفع وصل التحويل لتأكيد دفع المستحقات للبائع.</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <ReceiptUploader
                                    tradeId={tradeId}
                                    onUploadComplete={() => updateTradeStatus('Paid')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Seller: Confirm Release */}
                    {isSeller && tradeData.status === 'Paid' && (
                        <div className="mb-8 p-10 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20">
                            <div className="flex-1 text-center md:text-right">
                                <h3 className="text-2xl font-black mb-3 font-cairo">تأكيد استلام المبلغ</h3>
                                <p className="text-slate-400 font-medium">بعد تأكدك من وصول المبلغ لحسابك، قم بتحرير الأصول للمشتري فوراً.</p>
                            </div>
                            <button
                                disabled={isUpdating}
                                onClick={() => updateTradeStatus('Completed')}
                                className="w-full md:w-auto px-12 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50"
                            >
                                {isUpdating ? 'جاري التنفيذ...' : 'تحرير الأصول الآن'}
                            </button>
                        </div>
                    )}

                    <form onSubmit={sendMessage} className="flex items-center gap-4">
                        <button type="button" className="p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                            <ImageIcon className="w-7 h-7" />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="اكتب رسالتك هنا..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 pr-8 pl-14 text-slate-900 outline-none focus:border-emerald-500/50 transition-all font-medium font-cairo"
                            />
                            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl shadow-md">
                                <Send className="w-5 h-5 ltr-flip" />
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <DisputeModal
                isOpen={isDisputeModalOpen}
                onClose={() => setIsDisputeModalOpen(false)}
                tradeId={tradeId}
            />

            <style jsx>{`
                .ltr-flip { transform: scaleX(-1); }
            `}</style>
        </div>
    );
}
