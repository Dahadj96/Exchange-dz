'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Book, CreditCard, ShieldCheck, User, Search } from 'lucide-react';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`p-6 rounded-3xl border transition-all ${isOpen ? 'bg-white border-emerald-500/30 shadow-xl shadow-emerald-500/5' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-right"
            >
                <span className="text-xl font-black text-slate-900">{question}</span>
                <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pt-6 text-slate-500 leading-relaxed font-medium border-t border-slate-100 mt-6">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function HelpPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50/50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl font-black text-slate-900 mb-6 font-tajawal">مركز المساعدة</h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        كل ما تحتاج لمعرفته حول كيفية استخدام منصة DZ-Devise والتداول بأمان.
                    </p>
                    <div className="relative mt-12 max-w-xl mx-auto">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="كيف يمكننا مساعدتك اليوم؟"
                            className="w-full bg-white border border-slate-200 rounded-3xl py-6 pr-12 pl-6 outline-none focus:border-emerald-500 shadow-sm transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {[
                        { label: 'البداية', icon: Book, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'الدفع والتحويل', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'الأمان والخصوصية', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
                        { label: 'حسابي', icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((cat, i) => (
                        <button key={i} className="p-8 rounded-[40px] bg-white border border-slate-200 hover:border-emerald-500/30 transition-all shadow-sm group text-center">
                            <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                <cat.icon className={`w-7 h-7 ${cat.color}`} />
                            </div>
                            <span className="font-black text-slate-900">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="max-w-4xl mx-auto space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 mb-10">الأسئلة الشائعة</h2>
                    <FAQItem
                        question="كيف يعمل نظام الوساطة في DZ-Devise؟"
                        answer="ببساطة، عندما تفتح طلب تبادل، نقوم 'بحجز' المبلغ من البائع. تقوم أنت بالتحويل عبر Baridimob وترفع الوصل. بمجرد تأكيد البائع للاستلام، نقوم بتحرير المبلغ لحسابك فوراً. إذا فشلت العملية، يتدخل الدعم الفني لحل الأمر."
                    />
                    <FAQItem
                        question="ما هي العمولات التي تفرضها المنصة؟"
                        answer="نحن نفرض عمولة بسيطة جداً على عمليات البيع فقط لتغطية تكاليف الخوادم وتطوير المنصة. العمولات تظهر لك بوضوح قبل تأكيد أي عملية تبادل."
                    />
                    <FAQItem
                        question="هل هويتي محمية عند استخدام المنصة؟"
                        answer="نعم، نحن لا نشارك هويتك مع الطرف الآخر. نستخدم وثائق الهوية فقط للتحقق من أنك شخص حقيقي لمنع عمليات الاحتيال."
                    />
                    <FAQItem
                        question="ماذا أفعل إذا لم يرسل البائع العملة بعد التحويل؟"
                        answer="لا تقلق! طالما قمت برفع وصل دفع صحيح داخل الدردشة، يمكنك الضغط على 'فتح نزاع'. فريقنا سيراجع الطلب، وإذا ثبت تحويلك، سنقوم بنقل العملة إلى حسابك يدوياً من رصيد البائع المحجوز لدينا."
                    />
                </div>

                {/* Contact CTA */}
                <div className="mt-32 p-12 rounded-[60px] bg-slate-900 text-white flex flex-col items-center text-center relative overflow-hidden">
                    <h2 className="text-4xl font-black mb-6 relative z-10">لم تجد إجابتك؟</h2>
                    <p className="text-slate-400 text-xl mb-12 relative z-10 max-w-2xl">فريق دعم DZ-Devise متاح على مدار الساعة للإجابة على جميع استفساراتك ومساعدتك في عمليات التداول.</p>
                    <button className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-xl relative z-10">
                        تحدث مع الدعم الفني
                    </button>
                    <HelpCircle className="absolute -left-20 -bottom-20 w-80 h-80 text-white/5" />
                </div>
            </div>
        </div>
    );
}
