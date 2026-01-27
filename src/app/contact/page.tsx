'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h1 className="text-5xl font-black text-slate-900 mb-6 font-tajawal">اتصل بنـا</h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        نحن دائماً هنا للاستماع إليك. سواء كان لديك استفسار، اقتراح، أو واجهت مشكلة تقنية، فريقنا جاهز للرد عليك في أسرع وقت.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-200">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">معلومات التواصل</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-0.5">البريد الإلكتروني</span>
                                        <span className="text-slate-900 font-bold">contact@dzdevise.dz</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-0.5">الهاتف</span>
                                        <span className="text-slate-900 font-bold">+213 (0) 550 00 00 00</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                        <MessageCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-0.5">تيليجرام</span>
                                        <span className="text-slate-900 font-bold">@DZDevise_Support</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[40px] bg-emerald-600 text-white relative overflow-hidden shadow-2xl shadow-emerald-600/20">
                            <div className="relative z-10">
                                <Clock className="w-10 h-10 mb-6 opacity-50" />
                                <h3 className="text-xl font-black mb-2">توقيت العمل</h3>
                                <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                                    دعمنا الفني متاح طيلة أيام الأسبوع من الساعة 9:00 صباحاً حتى منتصف الليل.
                                </p>
                            </div>
                            <Globe className="absolute -left-10 -bottom-10 w-40 h-40 text-white/10" />
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-2xl shadow-slate-200/50">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 mr-2">الاسـم الكامل</label>
                                        <input
                                            type="text"
                                            placeholder="محمد بن علي"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 mr-2">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mr-2">الموضوع</label>
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium appearance-none">
                                        <option>استفسار عام</option>
                                        <option>مشكلة في عملية تبادل</option>
                                        <option>توثيق الحساب</option>
                                        <option>اقتراح تحسين</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mr-2">الرسالة</label>
                                    <textarea
                                        rows={5}
                                        placeholder="اكتب رسالتك بالتفصيل هنا..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium resize-none"
                                    ></textarea>
                                </div>
                                <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 group transition-all">
                                    إرسال الرسالة
                                    <Send className="w-5 h-5 group-hover:translate-x-[-5px] transition-transform ltr-flip" />
                                </button>
                            </form>
                        </div>
                    </div>
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
