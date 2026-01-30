'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Wallet } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Offer } from '@/types';
import { CreateOfferModal } from '@/components/CreateOfferModal';

export const MyOffersView = () => {
    if (!supabase) return null;
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);

        const { data } = await supabase
            .from('offers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        setOffers(data || []);
        setIsLoading(false);
    };


    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 mb-2">عروضي</h2>
                <p className="text-slate-500 font-medium">إدارة عروض التحويل الخاصة بك</p>
            </div>

            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mb-8 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black flex items-center gap-3 shadow-lg shadow-emerald-600/30 transition-all w-fit"
            >
                <Plus className="w-5 h-5" />
                إنشاء عرض جديد
            </button>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 animate-pulse h-32" />
                    ))}
                </div>
            ) : offers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">لا توجد عروض</h3>
                        <p className="text-slate-500 font-medium">أنشئ عرضك الأول الآن</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 pb-8">
                    {offers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-slate-900 mb-1">
                                            {offer.platform}
                                            <span className="mr-2 text-sm font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg">
                                                {offer.currency_code}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 font-medium">
                                            سعر الصرف: <span className="text-emerald-600 font-bold">{offer.rate} DZD</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <Edit className="w-5 h-5 text-slate-600" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <div className="text-xs text-slate-500 mb-1">المتاح للبيع</div>
                                    <div className="text-lg font-black text-slate-900">{offer.available_amount} {offer.currency_code}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <div className="text-xs text-slate-500 mb-1">الحد الأدنى</div>
                                    <div className="text-lg font-black text-slate-900">{offer.min_amount}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <div className="text-xs text-slate-500 mb-1">الحد الأقصى</div>
                                    <div className="text-lg font-black text-slate-900">{offer.max_amount}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {userId && (
                <CreateOfferModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        fetchOffers();
                        // Ideally show a toast here
                    }}
                />
            )}
        </div>
    );
};
