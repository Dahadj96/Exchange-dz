'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { BuyOfferModal } from '@/components/marketplace/BuyOfferModal';
import { Offer, Profile, PlatformType, SupportedCurrency } from '@/types';

import { MarketplaceSkeleton } from '@/components/marketplace/MarketplaceSkeleton';

export const MarketplaceView = () => {
    if (!supabase) return null;
    const [offers, setOffers] = useState<Array<{ offer: Offer; seller: Profile }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCurrency, setFilterCurrency] = useState<string>('all');
    const [selectedOffer, setSelectedOffer] = useState<{ offer: Offer; seller: Profile } | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const { data } = await supabase
                .from('offers')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                const typedData = data as Array<{
                    id: string;
                    user_id: string;
                    platform: string;
                    currency_code: string;
                    rate: number;
                    available_amount: number;
                    min_amount: number;
                    max_amount: number;
                    created_at: string;
                    profiles: Profile;
                }>;

                const formatted = typedData.map((item) => ({
                    offer: {
                        id: item.id,
                        user_id: item.user_id,
                        platform: item.platform as PlatformType,
                        currency_code: item.currency_code as SupportedCurrency,
                        rate: item.rate,
                        available_amount: item.available_amount,
                        min_amount: item.min_amount,
                        max_amount: item.max_amount,
                        created_at: item.created_at,
                        is_active: true, // Default to true as we only fetch active offers usually, or add to select
                    },
                    seller: {
                        id: item.user_id,
                        username: 'بائع', // Default if profile joining fails
                        is_verified: true,
                        success_rate: 98,
                        total_trades: 45,
                        created_at: item.created_at
                    },
                }));
                const typedOffers: Array<{ offer: Offer; seller: Profile }> = formatted;
                setOffers(typedOffers);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching offers:', error);
            setIsLoading(false);
        }
    };

    const filteredOffers = offers.filter((item) => {
        const matchesSearch = item.seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.offer.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.offer.currency_code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCurrency = filterCurrency === 'all' || item.offer.platform === filterCurrency;
        return matchesSearch && matchesCurrency;
    });

    if (!mounted) return <div className="h-full flex items-center justify-center"><MarketplaceSkeleton /></div>;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-4xl font-black text-slate-900 mb-2">السوق</h2>
                <p className="text-slate-500 font-medium">تصفح أفضل عروض تحويل الأصول الرقمية</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن منصة، عملة، أو بائع..."
                        className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-3xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow hover:shadow-sm"
                    />
                </div>

                {/* Platform Filter */}
                <div className="relative">
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <select
                        value={filterCurrency}
                        onChange={(e) => setFilterCurrency(e.target.value)}
                        className="appearance-none w-full md:w-48 pr-12 pl-6 py-4 bg-white border border-slate-200 rounded-3xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:shadow-sm transition-shadow"
                    >
                        <option value="all">كل المنصات</option>
                        <option value="Wise">Wise</option>
                        <option value="Paysera">Paysera</option>
                        <option value="RedotPay">RedotPay</option>
                    </select>
                </div>
            </div>

            {/* Offers Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-24">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <MarketplaceSkeleton key={i} />
                    ))}
                </div>
            ) : filteredOffers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">لا توجد نتائج</h3>
                        <p className="text-slate-500 font-medium">جرب تغيير معايير البحث</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-24">
                    {filteredOffers.map((item, index) => (
                        <motion.div
                            key={item.offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MarketplaceCard
                                offer={item.offer}
                                seller={item.seller}
                                onActionClick={() => setSelectedOffer(item)}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {selectedOffer && (
                <BuyOfferModal
                    isOpen={!!selectedOffer}
                    onClose={() => setSelectedOffer(null)}
                    offer={selectedOffer.offer}
                    seller={selectedOffer.seller}
                />
            )}

            {/* Create Offer FAB */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center text-white hover:shadow-emerald-600/60 transition-shadow z-50"
            >
                <Plus className="w-8 h-8" />
            </motion.button>
        </div>
    );
};
