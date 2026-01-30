'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    tradeId: string;
    onSuccess?: () => void;
}

export const DisputeModal = ({ isOpen, onClose, tradeId, onSuccess }: DisputeModalProps) => {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('يجب تسجيل الدخول أولاً');

            const { error: disputeError } = await supabase
                .from('disputes')
                .insert({
                    trade_id: tradeId,
                    raised_by: user.id,
                    reason: reason.trim(),
                    status: 'Open'
                });

            if (disputeError) throw disputeError;

            // Also update trade status to 'Disputed'
            await supabase
                .from('trades')
                .update({ status: 'Disputed' })
                .eq('id', tradeId);

            // Send system message to chat
            await supabase.from('messages').insert({
                trade_id: tradeId,
                sender_id: user.id,
                content: `⚠️ تم فتح نزاع في هذه المعاملة. السبب: ${reason.trim()}`,
            }).select('id, trade_id, sender_id, content, created_at');

            setSubmitted(true);
            onSuccess?.();
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setReason('');
            }, 2000);
        } catch (err: any) {
            console.error('Error raising dispute:', err);
            setError(err.message || 'حدث خطأ أثناء فتح النزاع');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                    <h2 className="text-xl font-black text-slate-900">فتح نزاع</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6">
                                {submitted ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">تم فتح النزاع بنجاح</h3>
                                        <p className="text-slate-500 font-medium">سيقوم فريق الدعم بمراجعة المعاملة قريباً.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                                            <Shield className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                            <p className="text-xs text-orange-800 font-medium leading-relaxed">
                                                بفتح نزاع، سيتم تعليق المعاملة وتدخل فريق الدعم للفصل بين الطرفين. يرجى تقديم سبب واضح.
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">
                                                {error}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">سبب النزاع</label>
                                            <textarea
                                                required
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                                placeholder="مثلاً: البائع لم يرسل الأصول، أو هناك مشكلة في البيانات..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading || !reason.trim()}
                                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? 'جاري الإرسال...' : 'تأكيد فتح النزاع'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
