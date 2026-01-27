'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, TrendingUp, Award, Filter } from 'lucide-react';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { AuthModal } from '@/components/auth/AuthModal';
import { BuyOfferModal } from '@/components/marketplace/BuyOfferModal';
import { Listing, Profile } from '@/types';
import { supabase } from '@/lib/supabase/client';

// Mock Data for demonstration
const MOCK_LISTINGS: (Listing & { seller: Profile })[] = [
    {
        id: '1',
        user_id: 'u1',
        platform: 'Wise',
        currency_code: 'EUR',
        rate: 245.5,
        stock: 500,
        min_amount: 50,
        max_amount: 500,
        is_active: true,
        created_at: new Date().toISOString(),
        seller: {
            id: 'u1',
            full_name: 'أحمد كمال',
            is_verified: true,
            success_rate: 98,
            total_trades: 156,
            created_at: new Date().toISOString(),
        }
    },
    {
        id: '2',
        user_id: 'u2',
        platform: 'Paysera',
        currency_code: 'EUR',
        rate: 242.0,
        stock: 450,
        min_amount: 20,
        max_amount: 450,
        is_active: true,
        created_at: new Date().toISOString(),
        seller: {
            id: 'u2',
            full_name: 'سارة محمد',
            is_verified: false,
            success_rate: 92,
            total_trades: 45,
            created_at: new Date().toISOString(),
        }
    },
    {
        id: '3',
        user_id: 'u3',
        platform: 'RedotPay',
        currency_code: 'USD',
        rate: 235.0,
        stock: 2100,
        min_amount: 10,
        max_amount: 2100,
        is_active: true,
        created_at: new Date().toISOString(),
        seller: {
            id: 'u3',
            full_name: 'متجر الثقة',
            is_verified: true,
            success_rate: 100,
            total_trades: 890,
            created_at: new Date().toISOString(),
        }
    }
];

export default function MarketplacePage() {
    if (!supabase) return null;
    const [user, setUser] = useState<any>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<(Listing & { seller: Profile }) | null>(null);
    const [assetFilter, setAssetFilter] = useState('All');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [minReputation, setMinReputation] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const filteredListings = MOCK_LISTINGS.filter(item => {
        // Asset type filter
        if (assetFilter !== 'All' && item.platform !== assetFilter) return false;

        // Amount range filter
        if (minAmount && item.min_amount < parseFloat(minAmount)) return false;
        if (maxAmount && item.max_amount > parseFloat(maxAmount)) return false;

        // Reputation filter
        if (item.seller.success_rate < minReputation) return false;

        // Search filter
        if (searchQuery && !item.seller.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.platform.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;
    });

    return (
        <>
            <div className="min-h-screen pt-32 pb-24 bg-white">
                <div className="container mx-auto px-6 lg:px-20">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 leading-tight">سوق الأصول الرقمية</h1>
                        <p className="text-slate-500 font-medium text-lg">تصفح أفضل عروض تحويل الأصول من مستخدمين موثوقين حول العالم.</p>
                    </div>

                    {/* Advanced Filter Bar - Sticky */}
                    <div className="sticky top-24 z-40 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1 group">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن مستخدم أو أصل..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl pr-12 py-4 text-slate-900 focus:border-emerald-500/50 shadow-sm transition-all outline-none font-medium"
                                />
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-6 py-4 rounded-3xl border transition-all font-bold flex items-center gap-2 ${showFilters
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                فلاتر متقدمة
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6"
                            >
                                {/* Amount Range */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">نطاق المبلغ</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            value={minAmount}
                                            onChange={(e) => setMinAmount(e.target.value)}
                                            placeholder="الحد الأدنى"
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-medium"
                                        />
                                        <input
                                            type="number"
                                            value={maxAmount}
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            placeholder="الحد الأقصى"
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Reputation Filter */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">
                                        الحد الأدنى للسمعة: {minReputation}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={minReputation}
                                        onChange={(e) => setMinReputation(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                                    />
                                </div>

                                {/* Clear Filters */}
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setMinAmount('');
                                            setMaxAmount('');
                                            setMinReputation(0);
                                            setSearchQuery('');
                                            setAssetFilter('All');
                                        }}
                                        className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                                    >
                                        إعادة تعيين الفلاتر
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Asset Type Quick Filters */}
                    <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                        {['All', 'Wise', 'Paysera', 'RedotPay', 'USDT', 'Payoneer', 'Skrill'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setAssetFilter(cat)}
                                className={`px-8 py-3.5 rounded-3xl border transition-all whitespace-nowrap font-bold text-sm shadow-sm ${assetFilter === cat
                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                            >
                                {cat === 'All' ? 'الكل' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-slate-500">عروض نشطة</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{filteredListings.length}</div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Award className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-slate-500">متوسط السمعة</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">
                                {Math.round(filteredListings.reduce((acc, item) => acc + item.seller.success_rate, 0) / filteredListings.length || 0)}%
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Filter className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-slate-500">موثقون</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">
                                {filteredListings.filter(item => item.seller.is_verified).length}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-slate-500">أفضل سعر</span>
                            </div>
                            <div className="text-3xl font-black text-emerald-600">
                                {Math.max(...filteredListings.map(item => item.rate)).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredListings.map((item) => (
                            <MarketplaceCard
                                key={item.id}
                                listing={item}
                                seller={item.seller}
                                onActionClick={() => {
                                    if (!user) {
                                        setShowAuthModal(true);
                                    } else {
                                        setSelectedOffer(item);
                                    }
                                }}
                            />
                        ))}
                    </div>

                    {/* Modals */}
                    {selectedOffer && (
                        <BuyOfferModal
                            isOpen={!!selectedOffer}
                            onClose={() => setSelectedOffer(null)}
                            listing={selectedOffer}
                            seller={selectedOffer.seller}
                        />
                    )}

                    {filteredListings.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-400 text-lg font-medium">لا توجد عروض متاحة حالياً تطابق معايير البحث.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Auth Modal for Guests */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultView="signup"
            />
        </>
    );
}
