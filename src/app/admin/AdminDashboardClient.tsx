'use client';

import React, { useState } from 'react';
import {
    ShieldAlert,
    Users,
    MessageSquare,
    TrendingUp,
    Search,
    AlertTriangle,
    Eye,
    CheckCircle
} from 'lucide-react';

interface Dispute {
    trade_id: string;
    reason: string;
    created_at: string;
    trade: {
        buyer: { full_name: string };
        seller: { full_name: string };
    };
}

interface AdminDashboardClientProps {
    stats: {
        totalUsers: number;
        activeDisputes: number;
        totalVolume: number;
    };
    recentDisputes: Dispute[];
}

export default function AdminDashboardClient({ stats, recentDisputes }: AdminDashboardClientProps) {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50/50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 font-tajawal">لوحة الإدارة</h1>
                        <p className="text-slate-500 font-medium">إدارة النزاعات والمستخدمين والمنصة بشكل عام.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'إجمالي المستخدمين', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'نزاعات نشطة', value: stats.activeDisputes || 0, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'رسائل الدعم', value: '45', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' }, // Placeholder
                        { label: 'حجم التداول اليومي', value: stats.totalVolume || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-6`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-sm text-slate-500 block mb-1 font-bold">{stat.label}</span>
                            <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Disputes Center */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900">مركز حل النزاعات</h2>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="بحث في النزاعات..."
                                    className="bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {recentDisputes.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">لا توجد نزاعات حالياً</div>
                            ) : (
                                recentDisputes.map((dispute, i) => (
                                    <div key={i} className="p-8 rounded-[32px] bg-white border border-slate-200 flex items-center justify-between hover:border-red-500/30 transition-all shadow-sm group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                                                <AlertTriangle className="w-7 h-7 text-red-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-slate-900 font-bold text-lg mb-1">نزاع في الطلب {dispute.trade_id}</h3>
                                                <p className="text-sm text-slate-500">
                                                    المشتري: <span className="text-slate-900 font-bold">{dispute.trade?.buyer?.full_name || '...'}</span> •
                                                    البائع: <span className="text-slate-900 font-bold">{dispute.trade?.seller?.full_name || '...'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right ml-6">
                                                <span className="text-red-500 text-xs font-black block mb-1 uppercase bg-red-50 px-2 py-1 rounded-md">{dispute.reason}</span>
                                                <span className="text-xs text-slate-400 font-medium">{new Date(dispute.created_at).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                            <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all border border-transparent group-hover:border-emerald-100 shadow-sm">
                                                <Eye className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Verification Area */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-slate-900">طلبات توثيق الهوية</h2>
                        <div className="p-8 rounded-[32px] bg-emerald-600 shadow-xl shadow-emerald-600/20 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <Users className="w-12 h-12 mb-6 opacity-50" />
                                <h3 className="text-xl font-black mb-2">8 طلبات جديدة</h3>
                                <p className="text-emerald-100 text-sm mb-6 leading-relaxed">يرجى مراجعة وثائق الهوية (بطاقة التعريف) للمستخدمين الجدد.</p>
                                <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-colors">
                                    ابدأ المراجعة
                                </button>
                            </div>
                            <CheckCircle className="absolute -left-10 -bottom-10 w-40 h-40 text-white/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
