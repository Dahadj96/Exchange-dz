'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wallet, Banknote, AlertCircle, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Listing, Profile } from '@/types';
import { useRouter } from 'next/navigation';

interface BuyOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: Listing;
    seller: Profile;
}

export const BuyOfferModal = ({ isOpen, onClose, offer, seller }: BuyOfferModalProps) => {
    if (!supabase) return null;
    const router = useRouter();
    const [amountAsset, setAmountAsset] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const numericAmount = Number(amountAsset || '0');
    const totalDzd = numericAmount * offer.rate;

    const isValid =
        numericAmount >= offer.min_amount &&
        numericAmount <= offer.max_amount &&
        numericAmount <= offer.available_amount;

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('يجب تسجيل الدخول أولاً');
            if (user.id === offer.user_id) throw new Error('لا يمكنك شراء عرضك الخاص');
            if (!offer.is_active) throw new Error('هذا العرض لم يعد نشطاً');
            if (numericAmount > offer.available_amount) throw new Error('الكمية المطلوبة غير متوفرة حالياً');

            // Insert into trades table with offer_id (referencing offers table)
            const { data: trade, error: tradeError } = await supabase
                .from('trades')
                .insert({
                    offer_id: offer.id, // Fixed: Uses offer_id instead of legacy listing_id
                    buyer_id: user.id,
                    seller_id: offer.user_id,
                    amount_asset: numericAmount,
                    amount_dzd: totalDzd,
                    status: 'Pending'
                })
                .select()
                .single();

            if (tradeError) {
                console.error('Supabase Trade Error:', tradeError);
                throw new Error(`خطأ في إنشاء الطلب: ${tradeError.message}`);
            }

            // Redirect to trade room
            router.push(`/trade/${trade.id}`);
            onClose();
        } catch (err: any) {
            console.error('Error creating trade:', err);
            setError(err.message || 'حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl pointer-events-auto overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">شراء {offer.currency_code}</h2>
                                    <p className="text-sm text-slate-500 font-medium">عبر {offer.platform}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                {/* Rate Info */}
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                                    <span className="text-sm font-bold text-emerald-800">سعر الصرف:</span>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-emerald-600">1 {offer.currency_code} = {offer.rate.toFixed(2)} DZD</span>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-900">المبلغ المراد شراؤه ({offer.currency_code})</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amountAsset}
                                            onChange={(e) => setAmountAsset(e.target.value)}
                                            placeholder={`أدخل المبلغ (${offer.min_amount} - ${offer.max_amount})`}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                        />
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                            {offer.currency_code}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold px-2">
                                        <span className="text-slate-400">الحد الأدنى: {offer.min_amount}</span>
                                        <span className="text-slate-400">المتوفر: {offer.available_amount}</span>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl shadow-slate-900/20">
                                    <div className="flex justify-between items-center opacity-70">
                                        <span className="text-sm font-medium">سوف تدفع بالدينار:</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-black">{totalDzd.toLocaleString()}</span>
                                        <span className="text-lg font-bold mb-1 opacity-70">DZD</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    disabled={!amountAsset || !isValid || isLoading}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-3xl font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    {isLoading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب وبدء الدردشة'}
                                    {!isLoading && <ArrowUpRight className="w-6 h-6" />}
                                </button>

                                <p className="text-center text-xs text-slate-400 font-medium">
                                    بالنقر على تأكيد، سيتم فتح غرفة دردشة آمنة مع البائع لإكمال المعاملة.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
