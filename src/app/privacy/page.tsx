'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';

const PrivacyCard = ({ icon: Icon, title, desc }: any) => (
    <div className="flex gap-6 p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-emerald-600 border border-slate-100">
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 font-tajawal">سياسة الخصوصية</h1>
                    </div>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        خصوصيتك هي أولويتنا. نحن نلتزم بحماية بياناتك الشخصية وضمان استخدامها فقط لتحسين تجربتك في التداول الآمن.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <PrivacyCard
                        icon={Eye}
                        title="البيانات التي نجمعها"
                        desc="نحتاج لجمع معلوماتك الشخصية (الاسم، البريد، الهاتف) ووثائق الهوية لتوثيق حسابك وضمان أمان المعاملات P2P."
                    />
                    <PrivacyCard
                        icon={Lock}
                        title="حماية البيانات"
                        desc="يتم تشفير كافة البيانات والوثائق المرفوعة باستخدام تقنيات تشفير متطورة ولا يتم مشاركتها مع أي طرف ثالث خارج المنصة."
                    />
                    <PrivacyCard
                        icon={Database}
                        title="تخزين المعلومات"
                        desc="نستخدم خوادم آمنة ومحمية لتخزين سجل الدردشة والمعاملات للرجوع إليها في حال حدوث نزاع قانوني بين الطرفين."
                    />
                    <PrivacyCard
                        icon={UserCheck}
                        title="صلاحياتك"
                        desc="يمكنك دائماً مراجعة بياناتك، تعديل الملف الشخصي، أو طلب إغلاق الحساب وحذف البيانات المرتبطة به وفق القوانين المعمول بها."
                    />
                </div>

                <div className="p-12 rounded-[50px] bg-slate-50 border border-slate-200 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-6">هل لديك أسئلة؟</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto mb-10 font-medium text-lg leading-relaxed">
                        إذا كان لديك أي استفسار حول كيفية تعاملنا مع بياناتك، لا تتردد في التواصل مع فريق حماية البيانات لدينا عبر البريد الإلكتروني.
                    </p>
                    <a href="mailto:privacy@dzdevise.dz" className="inline-flex px-10 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                        privacy@dzdevise.dz
                    </a>
                </div>
            </div>
        </div>
    );
}
