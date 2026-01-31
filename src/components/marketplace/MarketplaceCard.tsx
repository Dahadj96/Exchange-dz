'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ArrowUpRight, Award, TrendingUp, Wallet, MapPin } from 'lucide-react';
import { Offer, Profile } from '@/types';
import Link from 'next/link';
import { UserAvatar } from '../common/UserAvatar';

interface MarketplaceCardProps {
    offer: Offer;
    seller: Profile;
    onActionClick?: () => void;
}

export const MarketplaceCard = ({ offer, seller, onActionClick }: MarketplaceCardProps) => {
    const handleClick = (e: React.MouseEvent) => {
        if (onActionClick) {
            e.preventDefault();
            onActionClick();
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
        >
            {/* Seller Info with Trust Score */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        avatarUrl={seller.avatar_url}
                        username={seller.username}
                        size="xl"
                        className="w-14 h-14 text-xl rounded-2xl shadow-lg shadow-emerald-600/20"
                    />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-900 font-black text-lg">{seller.full_name || seller.username}</span>
                            {seller.is_verified && <BadgeCheck className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{seller.total_trades} معاملة</span>
                            {seller.city && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <MapPin className="w-3 h-3" />
                                        <span>{seller.city}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trust Score Badge */}
                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-700">{seller.success_rate}%</span>
                </div>
            </div>

            <div className="space-y-5">
                {/* Asset Type & Transfer Rate */}
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-sm text-slate-500 block mb-2 font-medium">المنصة / العملة</span>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Wallet className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <div className="text-xl font-black text-slate-900 leading-none mb-1">{offer.platform}</div>
                                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{offer.currency_code}</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-slate-500 block mb-2 font-medium">سعر الصرف</span>
                        <div className="flex items-end justify-end gap-1">
                            <span className="text-2xl font-black text-emerald-600">{offer.rate}</span>
                            <span className="text-xs font-black text-emerald-600/70 mb-1.5">DZD</span>
                        </div>
                    </div>
                </div>

                {/* Offer Details */}
                <div className="bg-slate-50 rounded-3xl p-5 flex justify-between items-center border border-slate-200">
                    <div>
                        <span className="text-xs text-slate-500 block mb-1 font-medium">عرض البيع</span>
                        <span className="text-base text-slate-900 font-black">{offer.available_amount} {offer.currency_code} على {offer.platform}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1 font-medium">سعر الصرف</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-slate-600">1 {offer.currency_code} =</span>
                            <span className="text-xl font-black text-emerald-600">{offer.rate.toFixed(2)}</span>
                            <span className="text-xs font-black text-emerald-600/70">DZD</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleClick}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-emerald-600/20"
                >
                    شراء {offer.currency_code} - الدفع بالـ DZD
                    <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};
