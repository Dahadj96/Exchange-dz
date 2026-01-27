'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { BuyOfferModal } from '@/components/marketplace/BuyOfferModal';
import { Listing, Profile } from '@/types';

export const MarketplaceView = () => {
    const [listings, setListings] = useState<Array<{ listing: Listing; seller: Profile }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCurrency, setFilterCurrency] = useState<string>('all');
    const [selectedOffer, setSelectedOffer] = useState<{ listing: Listing; seller: Profile } | null>(null);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data } = await supabase
                .from('offers')
                .select(`
          *,
          profiles:user_id (*)
        `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (data) {
                const formatted = data.map((item: any) => ({
                    listing: {
                        id: item.id,
                        user_id: item.user_id,
                        platform: item.platform,
                        currency_code: item.currency_code,
                        rate: item.rate,
                        stock: item.stock,
                        min_amount: item.min_amount,
                        max_amount: item.max_amount,
                        is_active: item.is_active,
                        created_at: item.created_at,
                    },
                    seller: item.profiles,
                }));
                const typedListings: Array<{ listing: Listing; seller: Profile }> = formatted;
                setListings(typedListings);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching listings:', error);
            setIsLoading(false);
        }
    };

    const filteredListings = listings.filter((item) => {
        const matchesSearch = item.seller.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.listing.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.listing.currency_code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCurrency = filterCurrency === 'all' || item.listing.platform === filterCurrency;
        return matchesSearch && matchesCurrency;
    });

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
                        <option value="USDT">USDT</option>
                        <option value="Payoneer">Payoneer</option>
                        <option value="Skrill">Skrill</option>
                    </select>
                </div>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white border border-slate-200 animate-pulse">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                                <div className="flex-1">
                                    <div className="w-32 h-4 bg-slate-200 rounded mb-2" />
                                    <div className="w-24 h-3 bg-slate-200 rounded" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="w-full h-20 bg-slate-200 rounded-2xl" />
                                <div className="w-full h-12 bg-slate-200 rounded-3xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredListings.length === 0 ? (
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
                    {filteredListings.map((item, index) => (
                        <motion.div
                            key={item.listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MarketplaceCard
                                listing={item.listing}
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
                    listing={selectedOffer.listing}
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
