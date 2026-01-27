'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Mail, Shield, Facebook, Instagram, Twitter, AlertTriangle } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-10">
            <div className="container mx-auto px-6 lg:px-20">
                {/* Legal Disclaimer - PROMINENT */}
                <div className="mb-16 p-8 bg-amber-50 border-2 border-amber-200 rounded-3xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-amber-900 mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                إخلاء المسؤولية القانونية
                            </h3>
                            <p className="text-amber-800 leading-relaxed font-medium text-sm">
                                <strong>Disclaimer:</strong> This platform is a pure technical intermediary for P2P messaging. We do not handle financial transactions or provide banking services. Users are responsible for local legal compliance.
                            </p>
                            <p className="text-amber-800 leading-relaxed font-medium text-sm mt-2">
                                هذه المنصة هي وسيط تقني بحت للتواصل بين الأشخاص. نحن لا نتعامل مع المعاملات المالية ولا نقدم خدمات مصرفية. المستخدمون مسؤولون عن الامتثال القانوني المحلي.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
                                <Globe className="text-white w-7 h-7" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">AssetBridge</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-sm font-medium">
                            منصة عالمية للتواصل الآمن بين الأفراد لتبادل الأصول الرقمية عبر Wise وRedotPay والمزيد.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/20 transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-6">
                        <h4 className="text-slate-900 font-black text-lg">المنصة</h4>
                        <ul className="space-y-4">
                            <li><Link href="/marketplace" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">سوق الأصول</Link></li>
                            <li><Link href="/rates" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">أسعار التحويل</Link></li>
                            <li><Link href="/blog" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">الأخبار</Link></li>
                            <li><Link href="/contact" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">اتصل بنـا</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-6">
                        <h4 className="text-slate-900 font-black text-lg">الدعم الفني</h4>
                        <ul className="space-y-4">
                            <li><Link href="/help" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">مركز المساعدة</Link></li>
                            <li><Link href="/rules" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">شروط الاستخدام</Link></li>
                            <li><Link href="/privacy" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">سياسة الخصوصية</Link></li>
                            <li><Link href="/help/safety" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">نصائح الأمان</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-slate-900 font-black text-lg">تواصل معنا</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-slate-500">
                                <Mail className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium">support@assetbridge.io</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-500">
                                <Globe className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium">Available Globally</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        © {new Date().getFullYear()} AssetBridge. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
