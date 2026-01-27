'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowDownRight, ArrowUpRight, Clock, Info } from 'lucide-react';

const RateDetail = ({ currency, buy, sell, change, status }: any) => (
    <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all">
        <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 text-xl shadow-inner">
                    {currency.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900">{currency}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${status === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {status === 'up' ? '+' : '-'}{change}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">آخر 24 ساعة</span>
                    </div>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <TrendingUp className="w-5 h-5" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold block mb-1">شـراء</span>
                <span className="text-2xl font-black text-slate-900">{buy} <small className="text-sm">DA</small></span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600 mt-2" />
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold block mb-1">بـيع</span>
                <span className="text-2xl font-black text-slate-900">{sell} <small className="text-sm">DA</small></span>
                <ArrowDownRight className="w-4 h-4 text-red-500 mt-2" />
            </div>
        </div>
    </div>
);

export default function RatesPage() {
    return (
        <div className="min-h-screen pt-44 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mb-16">
                    <h1 className="text-5xl font-black text-slate-900 mb-6 font-tajawal">أسعار الصرف اليوم</h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        متابعة حية لأسعار العملات الرقمية والصعبة في السوق الموازي الجزائري (السكوير). يتم تحديث الأسعار بناءً على متوسط عروض البيع والشراء في المنصة.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <RateDetail currency="Wise (Euro)" buy={245.5} sell={244.0} change={0.2} status="up" />
                    <RateDetail currency="Paysera (Euro)" buy={243.0} sell={241.5} change={0.1} status="up" />
                    <RateDetail currency="USDT (TRC20)" buy={224.5} sell={223.0} change={0.5} status="up" />
                    <RateDetail currency="Payoneer (USD)" buy={215.0} sell={213.5} change={0.3} status="down" />
                    <RateDetail currency="Skrill (Euro)" buy={205.0} sell={203.0} change={0.0} status="up" />
                    <RateDetail currency="RedotPay" buy={222.0} sell={220.5} change={0.4} status="up" />
                </div>

                <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border border-slate-100 shadow-sm text-emerald-600">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-1">تحديثات حية</h2>
                            <p className="text-slate-500 font-bold">آخر تحديث كان قبل 10 دقائق.</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 text-sm text-slate-500 max-w-lg">
                        <Info className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        <p className="leading-relaxed">
                            <span className="font-bold text-slate-700">تنبيه:</span> هذه الأسعار استرشادية فقط وقد تختلف من بائع لآخر حسب الكمية المتوفرة وموثوقية الطرفين.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
