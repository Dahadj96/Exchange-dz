'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Profile, Offer, Review } from '@/types';
import { ProfileSkeleton } from './ProfileSkeleton';
import { ReviewsSection } from './ReviewsSection';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { BuyOfferModal } from '@/components/marketplace/BuyOfferModal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { BadgeCheck, MapPin, Calendar, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProfileViewProps {
    userId: string;
}

export const ProfileView = ({ userId }: ProfileViewProps) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<{ offer: Offer; seller: Profile } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                // 1. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // 2. Fetch Active Offers
                const { data: offersData, error: offersError } = await supabase
                    .from('offers')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (offersError) throw offersError;
                setOffers(offersData as Offer[]);

                // 3. Fetch Reviews
                // 3. Fetch Reviews
                const { data: reviewsData, error: reviewsError } = await supabase
                    .from('reviews')
                    .select('*,reviewer:reviewer_id(username,avatar_url)')
                    .eq('reviewed_id', userId)
                    .order('created_at', { ascending: false });

                if (reviewsError) {
                    console.warn('Could not fetch reviews:', reviewsError.message);
                    // Treat missing reviews table or other errors as empty reviews for now
                    setReviews([]);
                } else {
                    setReviews(reviewsData as any[]);
                }

            } catch (err: any) {
                console.error('Error fetching profile data:', err);
                setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (isLoading) return <ProfileSkeleton />;

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">عذراً، المستخدم غير موجود</h2>
                <p className="text-slate-500 max-w-md mx-auto">{error || 'لم نتمكن من العثور على الصفحة التي تبحث عنها.'}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-l from-emerald-500/10 to-transparent" />

                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <UserAvatar
                            avatarUrl={profile.avatar_url}
                            username={profile.username}
                            size="xl"
                            className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] text-4xl shadow-2xl shadow-emerald-600/20 border-4 border-white"
                        />
                        {profile.is_verified && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white">
                                <BadgeCheck className="w-6 h-6" />
                            </div>
                        )}
                    </motion.div>

                    <div className="flex-1 text-center md:text-right space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 flex items-center justify-center md:justify-start gap-3">
                                {profile.full_name || profile.username}
                                {profile.is_verified && (
                                    <span className="px-3 py-1 bg-emerald-100/50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-200/50 flex items-center gap-1">
                                        <BadgeCheck className="w-4 h-4" />
                                        موثق
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">@{profile.username}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">النجاح</span>
                                    <span className="font-black text-slate-900">{profile.success_rate || 0}%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">المعاملات</span>
                                    <span className="font-black text-slate-900">{profile.total_trades || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">عضو منذ</span>
                                    <span className="font-black text-slate-900">
                                        {profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy', { locale: ar }) : 'غير معروف'}
                                    </span>
                                </div>
                            </div>
                            {profile.city && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <MapPin className="w-5 h-5 text-rose-500" />
                                    <span className="font-bold text-slate-900">{profile.city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers Section */}
            <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    عرض البيع النشط
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">{offers.length}</span>
                </h3>

                {offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {offers.map((offer, index) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MarketplaceCard
                                    offer={offer}
                                    seller={profile}
                                    onActionClick={() => setSelectedOffer({ offer, seller: profile })}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">لا توجد عروض نشطة حالياً لهذا المستخدم</p>
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <ReviewsSection reviews={reviews} />

            {/* Modals */}
            {selectedOffer && (
                <BuyOfferModal
                    isOpen={!!selectedOffer}
                    onClose={() => setSelectedOffer(null)}
                    offer={selectedOffer.offer}
                    seller={selectedOffer.seller}
                />
            )}
        </div>
    );
};
