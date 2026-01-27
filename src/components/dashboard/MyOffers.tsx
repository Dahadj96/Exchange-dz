'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Edit, Trash2, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Offer {
    id: string;
    currency: string;
    rate: number;
    stock: number;
    min_amount: number;
    is_active: boolean;
}

export const MyOffers = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMyOffers();
    }, []);

    const fetchMyOffers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('offers')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setOffers(data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching offers:', error);
            setIsLoading(false);
        }
    };

    const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
        // Optimistic update
        setOffers(offers.map(o =>
            o.id === offerId ? { ...o, is_active: !currentStatus } : o
        ));

        const { error } = await supabase
            .from('offers')
            .update({ is_active: !currentStatus })
            .eq('id', offerId);

        if (error) {
            // Revert on error
            setOffers(offers.map(o =>
                o.id === offerId ? { ...o, is_active: currentStatus } : o
            ));
            console.error('Error toggling offer:', error);
        }
    };

    const deleteOffer = async (offerId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

        // Optimistic update
        const previousOffers = [...offers];
        setOffers(offers.filter(o => o.id !== offerId));

        const { error } = await supabase
            .from('offers')
            .delete()
            .eq('id', offerId);

        if (error) {
            // Revert on error
            setOffers(previousOffers);
            console.error('Error deleting offer:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="animate-pulse space-y-4">
                    <div className="w-32 h-6 bg-slate-200 rounded" />
                    {[1, 2].map((i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                            <div className="w-24 h-4 bg-slate-200 rounded" />
                            <div className="w-32 h-3 bg-slate-200 rounded" />
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
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">عروضي</h3>
                <div className="px-3 py-1 bg-purple-50 rounded-full">
                    <span className="text-xs font-black text-purple-600">{offers.length} عرض</span>
                </div>
            </div>

            {offers.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium mb-4">لا توجد عروض نشطة</p>
                    <a
                        href="/dashboard/create"
                        className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all"
                    >
                        إنشاء عرض جديد
                    </a>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {offers.map((offer, index) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-slate-50 rounded-2xl"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${offer.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-sm font-black text-slate-900">{(offer as any).currency_code || (offer as any).currency}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                                            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                                            title={offer.is_active ? 'إيقاف' : 'تفعيل'}
                                        >
                                            {offer.is_active ? (
                                                <Eye className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-slate-400" />
                                            )}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setEditingId(offer.id)}
                                            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                                            title="تعديل"
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => deleteOffer(offer.id)}
                                            className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <div className="text-slate-500 font-medium mb-1">المعدل</div>
                                        <div className="font-black text-slate-900">{offer.rate}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 font-medium mb-1">المخزون</div>
                                        <div className="font-black text-slate-900">{offer.stock}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 font-medium mb-1">الحد الأدنى</div>
                                        <div className="font-black text-slate-900">{offer.min_amount}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};
