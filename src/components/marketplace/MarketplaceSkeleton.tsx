'use client';

import React from 'react';

export const MarketplaceSkeleton = () => {
    return (
        <div className="p-8 rounded-[32px] bg-white border border-slate-200 animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                    <div>
                        <div className="w-24 h-4 bg-slate-100 rounded-lg mb-2" />
                        <div className="w-32 h-3 bg-slate-50 rounded-lg" />
                    </div>
                </div>
                <div className="w-16 h-8 bg-slate-50 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="w-16 h-3 bg-slate-200/50 rounded-lg mb-2" />
                    <div className="w-20 h-5 bg-slate-200/50 rounded-lg" />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="w-16 h-3 bg-slate-200/50 rounded-lg mb-2" />
                    <div className="w-20 h-5 bg-slate-200/50 rounded-lg" />
                </div>
            </div>

            <div className="w-full h-14 bg-slate-100 rounded-3xl" />
        </div>
    );
};
