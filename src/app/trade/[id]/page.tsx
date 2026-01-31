'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    ShieldCheck,
    ChevronLeft,
    ImageIcon,
    CreditCard,
    Send,
    X,
    Check
} from 'lucide-react';
import { Trade, Message, TradeStatus } from '@/types';
import { supabase } from '@/utils/supabase/client';
import { useHasMounted } from '@/hooks/useHasMounted';
import { ReceiptUploader } from '@/components/trade/ReceiptUploader';
import { StatusStepper } from '@/components/trade/StatusStepper';
import { DisputeModal } from '@/components/trade/DisputeModal';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { UserAvatar } from '@/components/common/UserAvatar';

export default function TradeRoomPage() {
    const hasMounted = useHasMounted();
    const params = useParams();
    const router = useRouter();
    const tradeId = params.id as string;

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [user, setUser] = useState<any>(null);
    const [tradeData, setTradeData] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showPaymentSelection, setShowPaymentSelection] = useState(false);

    const { methods, loading: methodsLoading } = usePaymentMethods(user?.id);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                setUser({ ...user, profile });
            }
        };

        const fetchTradeData = async () => {
            const { data: trade } = await supabase
                .from('trades')
                .select(`
                    *,
                    offer:offer_id(*),
                    buyer:profiles!buyer_id(username, full_name, avatar_url),
                    seller:profiles!seller_id(username, full_name, avatar_url)
                `)
                .eq('id', tradeId)
                .single();

            if (trade) {
                setTradeData(trade);
                updateStep(trade.status);
            }
        };

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('trade_id', tradeId)
                .order('created_at', { ascending: true });
            if (data) setMessages(data);
        };

        if (tradeId) {
            fetchUser();
            fetchTradeData();
            fetchMessages();
        }

        // Realtime Subscriptions
        const tradeChannel = supabase
            .channel(`trade-status-${tradeId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'trades',
                filter: `id=eq.${tradeId}`
            }, (payload: any) => {
                setTradeData((prev: any) => ({ ...prev, ...payload.new }));
                updateStep(payload.new.status);
            })
            .subscribe();

        const messageChannel = supabase
            .channel(`trade-messages-${tradeId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `trade_id=eq.${tradeId}`
            }, (payload: any) => {
                setMessages((prev) => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(tradeChannel);
            supabase.removeChannel(messageChannel);
        };
    }, [tradeId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const updateStep = (status: TradeStatus) => {
        switch (status) {
            case 'Pending':
                setCurrentStep(1);
                break;
            case 'AwaitingPayment': // After agreement
                setCurrentStep(2);
                break;
            case 'payment_sent': // Buyer sent payment
            case 'Paid': // After payment confirmed/sent
            case 'AwaitingRelease':
                setCurrentStep(3);
                break;
            case 'Completed':
                setCurrentStep(4);
                break;
            default:
                setCurrentStep(1);
        }
    };

    const sendMessage = async (e?: React.FormEvent, content?: string, type: 'text' | 'payment_info' | 'system' = 'text') => {
        if (e) e.preventDefault();
        const msgContent = content || newMessage;
        if (!msgContent.trim()) return;

        const { error } = await supabase.from('messages').insert({
            trade_id: tradeId,
            sender_id: user.id,
            content: msgContent,
            type
        });

        if (!error) {
            setNewMessage('');
            setShowPaymentSelection(false);
        }
    };

    const handleSendPaymentInfo = () => {
        if (!methods || methods.length === 0) {
            alert('لا توجد طرق دفع محفوظة. يرجى إضافتها من الإعدادات.');
            return;
        }
        setShowPaymentSelection(true);
    };

    const handleSelectPaymentMethod = (method: any) => {
        const info = `بيانات الدفع الآمنة:\n${method.provider} - ${method.account_identifier}\nصاحب الحساب: ${user?.profile?.full_name} ✅`;
        sendMessage(undefined, info, 'payment_info');

        // Optionally update trade status to AwaitingPayment if it's currently Pending
        if (tradeData.status === 'Pending') {
            updateTradeStatus('AwaitingPayment');
        }
    };

    const updateTradeStatus = async (status: TradeStatus) => {
        setIsUpdating(true);
        const { error } = await supabase
            .from('trades')
            .update({ status })
            .eq('id', tradeId);

        if (!error) {
            // System message
            const statusMsg = status === 'Paid' ? 'تم تأكيد الدفع من قبل المشتري 💸' :
                status === 'Completed' ? 'تم تحرير الأصول بنجاح 🎉' :
                    status === 'AwaitingPayment' ? 'تم إرسال بيانات الدفع 🛡️' :
                        `تم تغيير الحالة إلى ${status}`;

            await supabase.from('messages').insert({
                trade_id: tradeId,
                sender_id: user.id,
                content: `🚀 ${status === 'payment_sent' ? 'قام المشتري بإرسال إثبات الدفع 🧾' : statusMsg}`,
                type: 'system'
            });
        }
        setIsUpdating(false);
    };

    const isBuyer = user?.id === tradeData?.buyer_id;
    const isSeller = user?.id === tradeData?.seller_id;

    // Check if payment info has been sent (either via message or in tradeData)
    const hasPaymentInfo = messages.some(m => m.type === 'payment_info') || tradeData?.payment_details;

    if (!hasMounted || !tradeData) return (
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

                {/* Dynamic Instructions Banner */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                            {/* Dynamic Icon */}
                            {currentStep === 4 ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-sm mb-1 font-cairo">المطلوب الآن:</h4>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                {tradeData.status === 'Pending' && isSeller && 'الرجاء الاتفاق مع المشتري ثم إرسال بيانات الدفع عبر الزر المخصص في الأسفل.'}
                                {tradeData.status === 'Pending' && isBuyer && 'في انتظار البائع لإرسال بيانات الدفع...'}

                                {(tradeData.status === 'AwaitingPayment') && isSeller && 'بانتظار المشتري لإتمام عملية التحويل ورفع الوصل.'}
                                {(tradeData.status === 'AwaitingPayment') && isBuyer && 'الرجاء تحويل المبلغ للحساب الموضح ورفع إثبات الدفع.'}

                                {(tradeData.status === 'payment_sent' || tradeData.status === 'Paid' || tradeData.status === 'AwaitingRelease') && isSeller && 'قام المشتري بالدفع. يرجى التأكد من وصول المبلغ لحسابك ثم تحرير العملة.'}
                                {(tradeData.status === 'payment_sent' || tradeData.status === 'Paid' || tradeData.status === 'AwaitingRelease') && isBuyer && 'بانتظار البائع لتأكيد الاستلام وتحرير العملة.'}

                                {tradeData.status === 'Completed' && 'تمت العملية بنجاح! شكراً لاستخدامكم منصتنا.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Secure Payment Info - Visible ONLY to Buyer when info is sent */}
                {isBuyer && hasPaymentInfo && (tradeData.status !== 'Completed') && (
                    <div className="p-8 rounded-3xl bg-emerald-600 text-white space-y-4 shadow-xl shadow-emerald-600/20">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-6 h-6" />
                            <h3 className="text-lg font-black">معلومات الدفع الآمنة</h3>
                        </div>
                        <p className="text-emerald-100 text-sm font-medium">قم بتحويل المبلغ باستخدام المعلومات المرسلة في الدردشة.</p>
                        <div className="text-[10px] text-emerald-200 font-bold leading-relaxed">
                            ⚠️ لا تقم بالتحويل خارج بيانات الدردشة لضمان حقك.
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
                        <UserAvatar
                            avatarUrl={isBuyer ? tradeData.seller?.avatar_url : tradeData.buyer?.avatar_url}
                            username={isBuyer ? (tradeData.seller?.username || 'البائع') : (tradeData.buyer?.username || 'المشتري')}
                            size="lg"
                            className="bg-emerald-50 border border-emerald-100 shadow-sm"
                        />
                        <div>
                            <h2 className="text-slate-900 font-black text-xl font-cairo">الدردشة الآمنة</h2>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">تواصل مع {isBuyer ? (tradeData.seller?.username || 'البائع') : (tradeData.buyer?.username || 'المشتري')} بأمان.</p>
                        </div>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        const isSystem = msg.type === 'system' || msg.content.includes('🚀');
                        const isPaymentInfo = msg.type === 'payment_info';

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center my-4' : ''}`}>
                                {isSystem ? (
                                    <div className="px-6 py-2 bg-slate-900/5 border border-slate-900/10 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className={`max-w-[70%] p-6 rounded-3xl shadow-sm relative ${isMe ? 'bg-emerald-600 text-white rounded-br-none' :
                                        isPaymentInfo ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-900 rounded-bl-none' :
                                            'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                                        }`}>
                                        {isPaymentInfo && (
                                            <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                                <CreditCard className="w-4 h-4" />
                                                <span className="text-xs font-bold">بيانات الدفع</span>
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
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
                <div className="p-8 border-t border-slate-100 bg-white relative">
                    {/* Buyer: Mark as Paid (Visible only after payment details sent) */}
                    {isBuyer && (tradeData.status === 'Pending' || tradeData.status === 'AwaitingPayment') && hasPaymentInfo && (
                        <div className="mb-8 p-8 border-2 border-dashed border-emerald-200 rounded-[40px] bg-emerald-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-right">
                                <h3 className="text-xl font-black text-emerald-900 mb-2 font-cairo">هل أتممت عملية التحويل؟</h3>
                                <p className="text-emerald-700 font-medium">يُرجى رفع وصل التحويل لتأكيد دفع المستحقات للبائع.</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <ReceiptUploader
                                    tradeId={tradeId}
                                    onUploadComplete={(url) => {
                                        // Send image message
                                        sendMessage(undefined, 'تم رفع وصل التحويل 🧾', 'image' as any); // Type cast if needed or add 'image' to types
                                        // Status update is handled inside ReceiptUploader but we can double check or refresh
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Seller: Confirm Release */}
                    {isSeller && (tradeData.status === 'payment_sent' || tradeData.status === 'Paid' || tradeData.status === 'AwaitingRelease') && (
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

                    <form onSubmit={(e) => sendMessage(e)} className="flex items-center gap-4 relative">
                        <button
                            type="button"
                            className="p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                            <ImageIcon className="w-7 h-7" />
                        </button>

                        {/* Send Payment Info Button (Seller Only) */}
                        {isSeller && (tradeData.status === 'Pending' || tradeData.status === 'AwaitingPayment') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={handleSendPaymentInfo}
                                    className={`p-5 bg-slate-50 border border-slate-200 rounded-3xl transition-all ${showPaymentSelection
                                        ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                    title="إرسال بيانات الدفع"
                                >
                                    <CreditCard className="w-7 h-7" />
                                </button>

                                {/* Payment Method Selection Dropdown */}
                                <AnimatePresence>
                                    {showPaymentSelection && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-full left-0 mb-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 overflow-hidden"
                                        >
                                            <div className="flex justify-between items-center mb-4 px-2">
                                                <span className="text-sm font-black text-slate-900">1. اختر وسيلة الدفع</span>
                                                <button onClick={() => setShowPaymentSelection(false)} className="text-slate-400 hover:text-slate-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {methods.map((method) => (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        onClick={() => handleSelectPaymentMethod(method)}
                                                        className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all text-right flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-sm">{method.provider}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-1">{method.account_identifier}</div>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-emerald-300">
                                                            <Check className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100" />
                                                        </div>
                                                    </button>
                                                ))}
                                                {methods.length === 0 && (
                                                    <Link href="/dashboard/settings" className="block text-center p-4 text-xs text-slate-400 hover:text-emerald-600">
                                                        + إضافة وسيلة دفع
                                                    </Link>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

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
