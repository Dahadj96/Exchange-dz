'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface RuleSectionProps {
    title: string;
    items: string[];
    type?: 'normal' | 'warning';
}

const RuleSection = ({ title, items, type = 'normal' }: RuleSectionProps) => (
    <div className={`p-8 rounded-[40px] border shadow-sm ${type === 'warning' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'
        }`}>
        <h3 className={`text-2xl font-black mb-6 ${type === 'warning' ? 'text-red-600' : 'text-slate-900'}`}>
            {title}
        </h3>
        <ul className="space-y-4">
            {items.map((item: string, i: number) => (
                <li key={i} className="flex gap-4">
                    {type === 'warning' ? (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    )}
                    <p className={`font-medium ${type === 'warning' ? 'text-red-700' : 'text-slate-600'}`}>{item}</p>
                </li>
            ))}
        </ul>
    </div>
);

export default function RulesPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <Gavel className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 font-tajawal">شروط الاستخدام والقوانين</h1>
                    </div>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        لضمان تجربة تداول آمنة وعادلة للجميع، يرجى الالتزام بالقواعد التالية. أي مخالفة قد تؤدي إلى تجميد حسابك نهائياً.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    <RuleSection
                        title="قواعد المتداولين"
                        items={[
                            "يجب أن يتطابق اسم صاحب الحساب في المنصة مع الاسم في بطاقة دفع Baridimob.",
                            "يمنع منعاً باتاً تداول العملات لأغراض غير قانونية أو مشبوهة.",
                            "يجب رفع وصل الدفع الحقيقي والواضح فور إتمام التحويل.",
                            "احترام وقت المعاملة المحدد وتجنب التأخير غير المبرر."
                        ]}
                    />
                    <RuleSection
                        title="قواعد البائعين"
                        items={[
                            "يجب توفر الرصيد المعلن عنه مسبقاً في حسابك.",
                            "تحرير العملة فور التأكد من وصول المبلغ إلى حسابك البريدي.",
                            "تقديم معلومات دفع (CCP/RIP) صحيحة وحديثة.",
                            "الرد السريع على استفسارات المشتري داخل غرفة الدردشة."
                        ]}
                    />
                    <RuleSection
                        title="الأمور المحظورة"
                        type="warning"
                        items={[
                            "طلب التواصل خارج المنصة (فيسبوك، واتساب، إلخ) لإتمام المعاملة.",
                            "استخدام وصولات دفع مزورة أو معدلة برامج التصميم.",
                            "محاولة الاحتيال أو الابتزاز بأي شكل من الأشكال.",
                            "استخدام حسابات متعددة لنفس الشخص."
                        ]}
                    />
                    <div className="p-10 rounded-[40px] bg-emerald-600 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-emerald-600/20">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-4">نظام النزاعات</h3>
                            <p className="text-emerald-100 leading-relaxed font-medium mb-8">
                                في حال حدوث أي خلاف، فريق الدعم لدينا يتدخل كطرف ثالث محايد. سنقوم بمراجعة الدردشة، وصل الدفع، وتاريخ الحسابات لاتخاذ القرار المناسب وإعادة الحق لأصحابه.
                            </p>
                            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                <AlertCircle className="w-6 h-6 text-white" />
                                <span className="font-bold">قرارات الدعم الفني نهائية وقطعية.</span>
                            </div>
                        </div>
                        <Info className="absolute -left-10 -bottom-10 w-48 h-48 text-white/10" />
                    </div>
                </div>

                <div className="text-center text-slate-400 text-sm font-bold">
                    آخر تحديث للاتفاقية: 24 جانفي 2026
                </div>
            </div>
        </div>
    );
}
