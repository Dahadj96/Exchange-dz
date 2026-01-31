import React from 'react';
import { Search } from 'lucide-react';
import { MarketplaceSkeleton } from '@/components/marketplace/MarketplaceSkeleton';

export const ProfileSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header Skeleton */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-slate-100 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-slate-100 animate-shimmer" />
                    </div>

                    <div className="flex-1 text-center md:text-right space-y-4 w-full">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-slate-100 rounded-lg mx-auto md:mx-0 animate-pulse" />
                            <div className="h-4 w-32 bg-slate-100 rounded-lg mx-auto md:mx-0 animate-pulse" />
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 w-32 bg-slate-100 rounded-full animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers Grid Skeleton */}
            <div>
                <div className="h-8 w-40 bg-slate-100 rounded-lg mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <MarketplaceSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};
