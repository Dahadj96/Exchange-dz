'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    Image as ImageIcon,
    AlertTriangle,
    ShieldCheck,
    Info,
    ChevronLeft,
    Clock
} from 'lucide-react';
import { Trade, Message, TradeStatus } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { ReceiptUploader } from '@/components/trade/ReceiptUploader';
import { StatusStepper } from '@/components/trade/StatusStepper';
import Link from 'next/link';

export default function TradeRoomPage() {
    if (!supabase) return null;
    const params = useParams();
    const tradeId = params.id as string;
    const [currentStep, setCurrentStep] = useState(1); // 1, 2, or 3
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [tradeData, setTradeData] = useState<any>(null); // Trade + Listing info

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        const fetchInitialData = async () => {
            // Fetch Trade Info with Listing Details
            const { data: trade } = await supabase
                .from('trades')
                .select(`
                    *,
                    listing:offers (
                        platform,
                        currency_code,
                        rate
                    ),
                    seller:profiles!trades_seller_id_fkey (full_name),
                    buyer:profiles!trades_buyer_id_fkey (full_name)
                `)
                .eq('id', tradeId)
                .single();

            // Map trade status to step number
            if (trade) {
                setTradeData(trade);
                if (trade.status === 'Pending' || trade.status === 'AwaitingPayment') {
                    setCurrentStep(1);
                } else if (trade.status === 'Paid') {
                    setCurrentStep(2);
                } else if (trade.status === 'AwaitingRelease' || trade.status === 'Completed') {
                    setCurrentStep(3);
                }
            }

            // Fetch Messages
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('trade_id', tradeId)
                .order('created_at', { ascending: true });

            if (msgs) setMessages(msgs as Message[]);
        };

        fetchUser();
        fetchInitialData();

        // Subscribe to messages
        const messageSub = supabase
            .channel(`trade-${tradeId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `trade_id=eq.${tradeId}`
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new as Message]);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'trades',
                filter: `id=eq.${tradeId}`
            }, (payload) => {
                const trade = payload.new as Trade;
                // Ideally we refetch full data here to get status updates, or just update status locally
                // fetchInitialData(); // Safest to refetch or just simple update:
                fetchInitialData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messageSub);
        };
    }, [tradeId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const { error } = await supabase.from('messages').insert({
            trade_id: tradeId,
            sender_id: user.id,
            content: newMessage,
        });

        if (!error) setNewMessage('');
    };

    const advanceStep = async () => {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);

        // Update trade status in database
        let newStatus: TradeStatus = 'Pending';
        if (newStep === 2) newStatus = 'Paid';
        if (newStep === 3) newStatus = 'Completed';

        await supabase
            .from('trades')
            .update({ status: newStatus })
            .eq('id', tradeId);
    };

    return (
        <div className="min-h-screen pt-32 bg-white flex flex-col lg:flex-row">
            {/* Left Side: Trade Details & Status Stepper */}
            <aside className="w-full lg:w-[480px] border-l border-slate-200 p-8 lg:p-10 space-y-8 overflow-y-auto bg-slate-50/50">
                <Link href="/marketplace">
                    <div className="flex items-center gap-4 text-slate-400 mb-6 cursor-pointer hover:text-slate-900 transition-colors bg-white w-fit px-5 py-3 rounded-3xl border border-slate-200 shadow-sm">
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                        <span className="text-sm font-bold">العودة للسوق</span>
                    </div>
                </Link>

                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-3 leading-tight">غرفة التحويل #{tradeId.slice(0, 6)}</h1>
                    <div className="flex items-center gap-2">
                        <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-200">عملية نشطة</span>
                        <span className="text-slate-500 text-sm font-medium">تحويل أصول رقمية</span>
                    </div>
                </div>

                {/* Status Stepper Component */}
                <StatusStepper currentStep={currentStep} />

                {/* Trade Info Card */}
                {tradeData && (
                    <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4">تفاصيل التحويل</h3>
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 font-bold">ما ترسله:</span>
                            <span className="text-slate-900 font-black text-2xl tracking-tight">{(tradeData.amount_asset * tradeData.listing.rate).toLocaleString()} DZD</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 font-bold">ما تستقبله:</span>
                            <span className="text-emerald-600 font-black text-2xl tracking-tight">{tradeData.amount_asset} {tradeData.listing.currency_code}</span>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">معدل التحويل:</span>
                                <span className="text-slate-900 font-bold text-lg">{tradeData.listing.rate} DZD</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">نوع الأصل:</span>
                                <span className="text-emerald-600 font-black text-lg">{tradeData.listing.platform} {tradeData.listing.currency_code}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">الطرف الأخر:</span>
                                <span className="text-slate-900 font-black text-lg">
                                    {user?.id === tradeData.seller_id ? tradeData.buyer?.full_name : tradeData.seller?.full_name}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <button className="w-full py-5 rounded-3xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all text-sm font-black flex items-center justify-center gap-2 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                    فتح نزاع
                </button>
            </aside>

            {/* Right Side: Real-time Chat Container */}
            <main className="flex-1 flex flex-col h-[calc(100vh-8rem)] bg-white">
                {/* Chat Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <ShieldCheck className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-slate-900 font-black text-xl">الدردشة الآمنة</h2>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">يتم تسجيل كافة المحادثات لضمان حقوقك.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-50 text-slate-400 border border-slate-100">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-white">
                    <div className="flex justify-center">
                        <div className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-full flex items-center gap-2 text-xs text-slate-500 font-bold shadow-sm">
                            <Info className="w-4 h-4 text-emerald-500" />
                            تجنب مشاركة معلوماتك خارج الدردشة
                        </div>
                    </div>

                    {/* System Instruction */}
                    {currentStep === 1 && (
                        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-sm">
                            <p className="text-emerald-700 text-lg font-bold leading-relaxed">
                                مرحباً بك! ابدأ بالتواصل مع الطرف الآخر للاتفاق على تفاصيل التحويل. بعد الاتفاق، قم بإتمام التحويل ورفع الإثبات.
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex flex-col gap-6">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={msg.id} className={`max-w-[75%] p-6 rounded-3xl shadow-sm ${isMe ? 'self-end bg-emerald-600 text-white rounded-br-none shadow-emerald-500/10' : 'self-start bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                                    <span className={`text-[10px] mt-3 block font-bold uppercase tracking-wider ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Input & Contextual Actions */}
                <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.03)]">
                    {/* Action Context */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-6 flex flex-col sm:flex-row items-center justify-between p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm gap-4"
                        >
                            <span className="text-lg font-black text-emerald-900">هل أنت جاهز للانتقال للخطوة التالية؟</span>
                            <button
                                onClick={advanceStep}
                                className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-sm font-black shadow-xl shadow-emerald-500/20 transition-all"
                            >
                                الانتقال لرفع الإثبات
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-6 p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6 shadow-sm"
                        >
                            <ReceiptUploader
                                tradeId={tradeId}
                                onUploadComplete={(url) => {
                                    // console.log removed
                                }}
                            />
                            <button
                                onClick={advanceStep}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-sm font-black shadow-xl shadow-emerald-500/20 transition-all"
                            >
                                تأكيد رفع الإثبات
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-6 p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center"
                        >
                            <p className="text-emerald-900 text-lg font-black">
                                ✅ تمت العملية بنجاح! شكراً لاستخدامك AssetBridge.
                            </p>
                        </motion.div>
                    )}

                    <form onSubmit={sendMessage} className="flex items-center gap-4">
                        <button type="button" className="p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm">
                            <ImageIcon className="w-7 h-7" />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="اكتب رسالتك للمستخدم الآخر هنا..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 pr-8 pl-14 text-slate-900 outline-none focus:border-emerald-500/50 shadow-inner transition-all font-medium"
                            />
                            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all shadow-md">
                                <Send className="w-5 h-5" style={{ transform: 'scaleX(-1)' }} />
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
