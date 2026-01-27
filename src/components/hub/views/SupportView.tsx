'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Mail } from 'lucide-react';

export const SupportView = () => {
    const faqs = [
        {
            q: 'كيف أبدأ تداولي الأول؟',
            a: 'تصفح السوق، اختر عرضاً مناسباً، وانقر على "طلب تحويل أصل" للبدء.',
        },
        {
            q: 'ما هي رسوم المنصة؟',
            a: 'المنصة مجانية تماماً. نحن وسيط تقني فقط ولا نتقاضى أي رسوم.',
        },
        {
            q: 'كيف أرفع إثبات الدفع؟',
            a: 'في غرفة التداول، استخدم زر المرفقات لرفع صورة الوصل أو لقطة الشاشة.',
        },
        {
            q: 'ماذا أفعل في حالة النزاع؟',
            a: 'تواصل مع فريق الدعم فوراً عبر نموذج الاتصال أدناه.',
        },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 mb-2">الدعم والمساعدة</h2>
                <p className="text-slate-500 font-medium">نحن هنا لمساعدتك في أي وقت</p>
            </div>

            <div className="space-y-6">
                {/* Quick Contact */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <button className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all text-right">
                        <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
                        <div className="text-lg font-black text-slate-900 mb-1">الدردشة المباشرة</div>
                        <div className="text-sm text-slate-600 font-medium">متاح 24/7</div>
                    </button>
                    <button className="p-6 rounded-3xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all text-right">
                        <Mail className="w-8 h-8 text-blue-600 mb-3" />
                        <div className="text-lg font-black text-slate-900 mb-1">البريد الإلكتروني</div>
                        <div className="text-sm text-slate-600 font-medium">رد خلال 24 ساعة</div>
                    </button>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-emerald-600" />
                        الأسئلة الشائعة
                    </h3>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="p-5 bg-slate-50 rounded-2xl border border-slate-200"
                            >
                                <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    {faq.q}
                                </h4>
                                <p className="text-slate-600 font-medium leading-relaxed pr-4">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-6">تواصل معنا</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="الموضوع"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <textarea
                            placeholder="رسالتك..."
                            rows={4}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black transition-all shadow-lg shadow-emerald-600/30">
                            إرسال الرسالة
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
