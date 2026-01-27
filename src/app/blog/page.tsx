'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Newspaper, Clock, User, ArrowRight, Share2 } from 'lucide-react';

const BlogCard = ({ title, date, author, category, image, desc }: any) => (
    <div className="group bg-white rounded-[40px] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
        <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            <div className="absolute top-6 right-6 z-10 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                {category}
            </div>
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-0"
            />
        </div>
        <div className="p-10 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {date}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {author}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors leading-tight">
                {title}
            </h3>
            <p className="text-slate-500 leading-relaxed font-medium mb-8 line-clamp-3">
                {desc}
            </p>
            <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-100">
                <button className="flex items-center gap-2 text-emerald-600 font-black text-sm group/btn">
                    اقرأ المزيد
                    <ArrowRight className="w-4 h-4 translate-x-1 group-hover/btn:translate-x-0 transition-transform ltr-flip" />
                </button>
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

export default function BlogPage() {
    return (
        <div className="min-h-screen pt-44 pb-20 bg-slate-50/30">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black mb-8 border border-emerald-100">
                        <TrendingUp className="w-4 h-4" />
                        <span>تحليلات السوق وأخبار العملات</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 font-tajawal">آخر التحديثات</h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        كن أول من يعلم بتقلبات أسعار العملات في السوق الموازي والقرارات المالية الجديدة في الجزائر.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    <BlogCard
                        category="تحليل السوق"
                        title="لماذا ارتفعت أسعار اليورو في السكوير هذا الأسبوع؟"
                        date="24 جانفي 2026"
                        author="أمين المالي"
                        image="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800"
                        desc="نحلل في هذا التقرير الأسباب الكامنة وراء القفزة المفاجئة لأسعار صرف اليورو مقابل الدينار في السوق السوداء وتوقع اتجاهات الأسبوع القادم."
                    />
                    <BlogCard
                        category="أخبار المنصة"
                        title="DZ-Devise تطلق محفظتها الرقمية المتكاملة للمتداولين"
                        date="22 جانفي 2026"
                        author="فريق التطوير"
                        image="https://images.unsplash.com/photo-1621416848469-e09d544066c7?q=80&w=800"
                        desc="يسعدنا الإعلان عن إطلاق نظام المحفظة الجديد الذي يسهل عملية تتبع الأرصدة وإتمام المعاملات بسرعة البرق داخل المنصة."
                    />
                    <BlogCard
                        category="دليل المبتدئين"
                        title="كيف تتداول الـ USDT بأمان عبر Baridimob؟"
                        date="20 جانفي 2026"
                        author="سارة للتداول"
                        image="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800"
                        desc="دليل شامل خطوة بخطوة لكل ما تحتاج معرفته لبدء تداول العملات الرقمية المستقرة في الجزائر وتجنب عمليات الاحتيال الشائعة."
                    />
                </div>

                <div className="p-12 rounded-[60px] bg-slate-900 text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                    <div className="relative z-10 flex-1 text-center md:text-right">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">اشترك في نشرتنا البريدية</h2>
                        <p className="text-slate-400 text-lg font-medium">احصل على تحديثات يومية للأسعار مباشرة في بريدك الإلكتروني.</p>
                    </div>
                    <div className="relative z-10 w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="px-8 py-5 bg-white/10 border border-white/20 rounded-3xl outline-none focus:border-emerald-500 transition-all text-white w-full md:w-80"
                            />
                            <button className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black transition-all shadow-xl shadow-emerald-600/20 whitespace-nowrap">
                                اشترك الآن
                            </button>
                        </div>
                    </div>
                    <Newspaper className="absolute -left-10 -bottom-10 w-48 h-48 text-white/5" />
                </div>
            </div>
            <style jsx global>{`
                .ltr-flip {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}
