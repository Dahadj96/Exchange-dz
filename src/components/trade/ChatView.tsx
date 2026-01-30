
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, ShieldCheck, CreditCard, Paperclip } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Message, Trade } from '@/types';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface ChatViewProps {
    tradeId: string;
    currentUser: any;
    tradeData: any; // Using any for now to avoid strict type issues during refactor
}

export const ChatView = ({ tradeId, currentUser, tradeData }: ChatViewProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Payment methods for "Send Payment Info"
    const { methods } = usePaymentMethods(currentUser?.id);

    const isBuyer = currentUser?.id === tradeData?.buyer_id;
    const otherUsername = isBuyer ? (tradeData.seller?.username || 'البائع') : (tradeData.buyer?.username || 'المشتري');

    // 1. Fetch Initial Messages
    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('trade_id', tradeId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data as Message[]);
        };

        fetchMessages();

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`chat-${tradeId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `trade_id=eq.${tradeId}`
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tradeId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async (e?: React.FormEvent, contentOverride?: string, imageUrl?: string) => {
        if (e) e.preventDefault();
        const content = contentOverride ?? newMessage.trim();

        // Allow sending if there's content OR an image
        if ((!content && !imageUrl) || !currentUser) return;

        const payload = {
            trade_id: tradeId,
            sender_id: currentUser.id,
            content: content,
            image_url: imageUrl || null // Add image_url to payload
        };

        const { error, status } = await supabase
            .from('messages')
            .insert(payload);

        if (error) {
            console.error('Error sending message:', error);
            alert('فشل إرسال الرسالة');
        } else {
            if (!contentOverride && !imageUrl) setNewMessage('');
        }
    };

    // 3. Image Upload Logic
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('حجم الصورة كبير جداً (الحد الأقصى 2MB)');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('يرجى اختيار ملف صور صالح');
            return;
        }

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${tradeId}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'chat-attachments' bucket
            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            // Send message with image
            await sendMessage(undefined, '', publicUrl);

        } catch (error: any) {
            console.error('Upload failed:', error);
            alert('فشل رفع الصورة: ' + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendPaymentInfo = () => {
        if (!methods || methods.length === 0) {
            alert('لا توجد طرق دفع محفوظة. يرجى إضافتها من الإعدادات.');
            return;
        }

        if (!currentUser?.profile?.full_name) {
            alert('يرجى إكمال ملفك الشخصي (الاسم الكامل) لإرسال بيانات الدفع.');
            return;
        }

        const defaultMethod = methods[0];
        const info = `بيانات الدفع الآمنة:\n${defaultMethod.provider} - ${defaultMethod.account_identifier}\nصاحب الحساب: ${currentUser.profile.full_name} ✅`;

        if (confirm('هل تريد إرسال بيانات الدفع الافتراضية للدردشة؟')) {
            sendMessage(undefined, info);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-slate-900 font-black text-lg font-cairo">الدردشة الآمنة</h2>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">تواصل مع {otherUsername} بأمان</p>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 my-10 text-sm">لا توجد رسائل بعد. ابدأ المحادثة!</div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const isSystem = msg.content?.includes('🚀');

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center my-4' : ''}`}>
                            {isSystem ? (
                                <div className="px-4 py-1 bg-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isMe
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                                    }`}>
                                    {msg.image_url && (
                                        <div className="mb-2 rounded-xl overflow-hidden border border-black/10">
                                            <img src={msg.image_url} alt="attachement" className="w-full h-auto max-h-60 object-cover" />
                                        </div>
                                    )}
                                    {msg.content && <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>}
                                    <div className={`text-[9px] mt-1 font-bold uppercase ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={(e) => sendMessage(e)} className="flex items-end gap-2">
                    {/* Image Upload Button */}
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
                            title="إرفاق صورة"
                        >
                            {isUploading ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Payment Info Button */}
                    <button
                        type="button"
                        onClick={handleSendPaymentInfo}
                        className={`p-3 rounded-xl transition-all ${methods.length > 0
                            ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            : 'text-slate-400 bg-slate-100 hover:text-slate-600'
                            }`}
                        title="إرسال بيانات الدفع"
                    >
                        <CreditCard className="w-5 h-5" />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="اكتب رسالتك..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none h-[50px] max-h-[120px]"
                            style={{ minHeight: '50px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !isUploading}
                        className="p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                        <Send className="w-5 h-5 ltr-flip" />
                    </button>
                </form>
            </div>

            <style jsx>{`
                .ltr-flip { transform: scaleX(-1); }
            `}</style>
        </div>
    );
};
