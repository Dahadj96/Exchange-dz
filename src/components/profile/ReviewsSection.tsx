'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '@/types';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReviewsSectionProps {
    reviews: Review[];
}

export const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
    const averageRating = reviews.length
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">التقييمات والمراجعات</h3>
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-black text-slate-900">{averageRating.toFixed(1)}</span>
                    <span className="text-slate-500">({reviews.length} تقييم)</span>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">لا توجد تقييمات بعد</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        avatarUrl={review.reviewer?.avatar_url}
                                        username={review.reviewer?.username || 'مستخدم'}
                                        size="md"
                                        className="shadow-sm"
                                    />
                                    <div>
                                        <div className="font-bold text-slate-900">
                                            {review.reviewer?.full_name || review.reviewer?.username || 'مستخدم'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
