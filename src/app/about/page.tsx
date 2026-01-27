'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Users, Zap, Heart, Award } from 'lucide-react';

const ValueCard = ({ icon: Icon, title, desc }: any) => (
    <div className="p-10 rounded-[40px] bg-white border border-slate-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group border-b-4 hover:border-b-emerald-600">
        <div className="w-16 h-16 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-32">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-black mb-8 shadow-sm"
                    >
                        <span>قصتنا ورؤيتنا</span>
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-10 leading-tight tracking-tight">
                        نبني مستقبلاً مـاليـاً <span className="text-emerald-600">آمـنـاً</span> للجزائريين
                    </h1>
                    <p className="text-2xl text-slate-500 leading-relaxed max-w-3xl mx-auto font-medium">
                        بدأت DZ-Devise كفكرة بسيطة لحل مشكلة الاحتيال في تداول العملات الرقمية عبر شبكات التواصل الاجتماعي. اليوم، نحن نسعى لنكون الوجهة الأولى والموثوقة لكل متداول في الجزائر.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-slate-50 py-32 border-y border-slate-200">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl font-black text-slate-900">مبادئنا الأساسية</h2>
                        <p className="text-slate-500 text-xl font-medium">ما يحركنا يوماً بعد يوم لتقديم أفضل خدمة.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={ShieldCheck}
                            title="الأمان أولاً"
                            desc="لا تهاون في حماية أموال المستخدمين. نظام الوساطة لدينا يضمن حق كل طرف بنسبة 100%."
                        />
                        <ValueCard
                            icon={Heart}
                            title="الشفافية"
                            desc="نؤمن بأن الصدق هو مفتاح النجاح. جميع عمولاتنا واضحة، وتقييمات المستخدمين حقيقية تماماً."
                        />
                        <ValueCard
                            icon={Target}
                            title="الابتكار"
                            desc="نطور أدواتنا باستمرار لنجعل عملية التداول أسرع وأبسط، مع الحفاظ على أعلى معايير الحماية."
                        />
                    </div>
                </div>
            </section>

            {/* Status Section */}
            <section className="py-32 container mx-auto px-6">
                <div className="bg-emerald-600 rounded-[60px] p-12 md:p-24 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl shadow-emerald-600/30">
                    <div className="relative z-10 flex-1">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">ثـقـة تـنـمـو يـومـاً بـعـد يـوم</h2>
                        <p className="text-emerald-50 text-xl md:text-2xl leading-relaxed mb-10 font-bold opacity-90">
                            نحن لا نوفر منصة فحسب، بل نبني مجتمعاً من المتداولين الموثوقين الذين يساهمون في دعم الاقتصاد الرقمي في الجزائر.
                        </p>
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <span className="text-4xl md:text-5xl font-black text-white block mb-2">+10k</span>
                                <span className="text-emerald-100 text-sm font-bold opacity-80 uppercase tracking-widest">مستخدم</span>
                            </div>
                            <div>
                                <span className="text-4xl md:text-5xl font-black text-white block mb-2">+50k</span>
                                <span className="text-emerald-100 text-sm font-bold opacity-80 uppercase tracking-widest">عملية ناجحة</span>
                            </div>
                            <div>
                                <span className="text-4xl md:text-5xl font-black text-white block mb-2">4.9</span>
                                <span className="text-emerald-100 text-sm font-bold opacity-80 uppercase tracking-widest">تقييم المنصة</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 relative z-10 hidden lg:block">
                        <Award className="w-64 h-64 text-white opacity-20" />
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
                </div>
            </section>
        </div>
    );
}
