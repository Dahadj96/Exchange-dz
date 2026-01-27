'use client';

import React from 'react';
import Link from 'next/link';
import {
    History,
    Settings,
    Star,
    BadgeCheck,
    TrendingUp,
    Activity,
    ChevronLeft,
    ShieldCheck,
    PlusCircle
} from 'lucide-react';
import { Profile, Trade } from '@/types';

interface DashboardClientProps {
    profile: Profile | null;
    trades: Trade[];
}

export default function DashboardClient({ profile, trades }: DashboardClientProps) {
    // Stats calculation based on real data or fallback
    // For now we might hardcode some if they aren't calculated in backend yet
    const stats = [
        { label: 'إجمالي الحجم المتداول', value: '45,210 €', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' }, // Placeholder calc
        { label: 'الطلبات المكتملة', value: profile?.total_trades || 0, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'قيد المراجعة', value: trades.filter(t => t.status === 'Pending').length, icon: Star, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen pt-44 pb-20 bg-slate-50/50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="w-full md:w-80 space-y-8">
                        <div className="p-8 rounded-[32px] bg-white border border-slate-200 text-center shadow-sm">
                            <div className="w-24 h-24 rounded-3xl bg-emerald-600 mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-emerald-600/30">
                                <span className="text-4xl font-black text-white">
                                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">{profile?.full_name || 'مستخدم جديد'}</h2>
                            {profile?.is_verified && (
                                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-6">
                                    <BadgeCheck className="w-4 h-4" />
                                    <span className="text-xs font-black">عضو موثق</span>
                                </div>
                            )}
                            {!profile?.is_verified && (
                                <div className="flex items-center justify-center gap-1 text-slate-400 mb-6">
                                    <span className="text-xs font-black">غير موثق</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] text-slate-500 block font-bold mb-1">السمعة</span>
                                    <span className="text-sm font-black text-slate-900">{profile?.success_rate || 100}%</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] text-slate-500 block font-bold mb-1">العمليات</span>
                                    <span className="text-sm font-black text-slate-900">{profile?.total_trades || 0}</span>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {[
                                { label: 'نظرة عامة', icon: Activity, active: true, href: '/dashboard' },
                                { label: 'العمليات النشطة', icon: History, active: false, href: '/dashboard' }, // TODO: create trades page
                                { label: 'الإعدادات', icon: Settings, active: false, href: '/dashboard/settings' },
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${item.active
                                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-12">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-6`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <span className="text-sm text-slate-500 block mb-1 font-bold">{stat.label}</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Active Trades */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-slate-900">عمليات نشطة حالياً</h2>
                                <Link
                                    href="/dashboard/create"
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    نشر عرض جديد
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {trades.length === 0 ? (
                                    <div className="p-8 rounded-[32px] bg-white border border-slate-200 text-center py-12">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <History className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-slate-900 font-bold text-lg mb-1">لا توجد عمليات نشطة</h3>
                                        <p className="text-slate-500">ابدأ بإنشاء عرض جديد او تصفح العروض المتاحة</p>
                                    </div>
                                ) : (
                                    trades.map((trade, i) => (
                                        <div key={i} className="p-8 rounded-[32px] bg-white border border-slate-200 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <span className="text-emerald-600 font-black text-lg">{trade.amount_asset}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-slate-900 font-black text-xl mb-1">طلب تبادل #{trade.id.substring(0, 8)}</h3>
                                                    <p className="text-sm text-slate-500 font-medium">
                                                        {/* We handle partner name safely as it's joined in the query */}
                                                        مع <span className="text-slate-900 font-bold">{(trade as any).partner?.full_name || '...'}</span> • {new Date(trade.created_at).toLocaleDateString('ar-SA')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider ${trade.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    }`}>
                                                    {trade.status === 'Paid' ? 'تم الدفع' : trade.status}
                                                </span>
                                                <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all border border-transparent group-hover:border-emerald-100 shadow-sm">
                                                    <ChevronLeft className="w-6 h-6 rotate-180" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
