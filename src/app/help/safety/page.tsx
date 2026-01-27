'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, UserCheck, Smartphone, Eye, ExternalLink } from 'lucide-react';

const SafetyTip = ({ icon: Icon, title, desc, danger = false }: any) => (
    <div className={`p-8 rounded-[40px] border transition-all ${danger ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'
        }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${danger ? 'bg-white text-red-600 border-red-100' : 'bg-slate-50 text-emerald-600 border-slate-100'
            }`}>
            <Icon className="w-7 h-7" />
        </div>
        <h3 className={`text-2xl font-black mb-4 ${danger ? 'text-red-900' : 'text-slate-900'}`}>{title}</h3>
        <p className={`font-medium leading-relaxed ${danger ? 'text-red-700' : 'text-slate-500'}`}>{desc}</p>
    </div>
);

export default function SafetyGuidePage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-black mb-8 shadow-sm"
                    >
                        <span>دليلك للتداول الآمن</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight">
                        أمانك <span className="text-emerald-600">هدفنا الأول</span> في DZ-Devise
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
                        اتبع هذه القواعد الذهبية لضمان حماية أموالك وبياناتك عند التداول بنظام P2P عبر المنصة.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <SafetyTip
                        icon={ShieldCheck}
                        title="ابقَ دائماً داخل المنصة"
                        desc="لا تقبل أبداً التواصل عبر واتساب أو فيسبوك لإتمام المعاملة. الدردشة داخل DZ-Devise هي مرجعك القانوني الوحيد عند حدوث أي نزاع."
                    />
                    <SafetyTip
                        icon={Smartphone}
                        title="تحقق من تطبيق Baridimob"
                        desc="كتاول كبائع، لا تعتمد على الرسائل القصيرة (SMS) للتأكد من وصول المبلغ. قم دائماً بالدخول لتطبيق Baridimob وتأكد من الرصيد والبيانات بنفسك."
                    />
                    <SafetyTip
                        icon={AlertTriangle}
                        title="احذر من الهندسة الاجتماعية"
                        danger={true}
                        desc="تجاهل أي شخص يدعي أنه 'موظف في المنصة' يطلب منك تحرير العملة قبل الدفع. الموظفون لا يتدخلون في الطلبات إلا عند فتح نزاع رسمي."
                    />
                    <SafetyTip
                        icon={Eye}
                        title="دقق في وصل التحويل"
                        desc="عند استلام الوصل من المشتري، تأكد من أن التاريخ، الوقت، واسم المرسل صحيح وغير معدل ببرامج التصميم."
                    />
                </div>

                <div className="bg-slate-900 rounded-[60px] p-12 md:p-24 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl">
                        <UserCheck className="w-16 h-16 text-emerald-500 mb-8" />
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">نظام التحقق من الهوية</h2>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 font-medium">
                            نحن نقوم بمراجعة وثائق الهوية لكل المتداولين على المنصة. العلامة الخضراء في الملف الشخصي تعني أننا تأكدنا من هوية الشخص الحقيقية، مما يمنحك طبقة أمان إضافية عند التعامل معه.
                        </p>
                        <button className="px-12 py-5 bg-white text-slate-900 rounded-3xl font-black text-lg hover:bg-emerald-50 transition-all flex items-center gap-3">
                            ابدأ توثيق حسابك الآن
                            <ExternalLink className="w-5 h-5 ltr-flip" />
                        </button>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
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
