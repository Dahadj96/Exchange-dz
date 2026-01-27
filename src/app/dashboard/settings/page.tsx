'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    Mail,
    Lock,
    Shield,
    Bell,
    Trash2,
    Save,
    Camera,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || '');
                setPhone(user.user_metadata?.phone || '');
                setEmail(user.email || '');
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async () => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                phone: phone
            }
        });

        if (!error) {
            alert('تم تحديث البيانات بنجاح!');
        } else {
            alert('خطأ: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50/50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2 font-tajawal">إعدادات الحساب</h1>
                            <p className="text-slate-500 font-medium">تحكم في بياناتك الشخصية وتفضيلات الأمان.</p>
                        </div>
                        <Link href="/dashboard" className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm">
                            <ChevronLeft className="w-6 h-6 rotate-180" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Navigation Tabs */}
                        <div className="space-y-4">
                            {[
                                { label: 'البيانات الشخصية', icon: User, active: true },
                                { label: 'الأمان والحماية', icon: Shield, active: false },
                                { label: 'الإشعارات', icon: Bell, active: false },
                                { label: 'حذف الحساب', icon: Trash2, active: false, danger: true },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm ${item.active
                                            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                                            : item.danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-500 hover:bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="p-10 rounded-[40px] bg-white border border-slate-200 shadow-sm space-y-10">
                                {/* Profile Picture Area */}
                                <div className="flex items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[32px] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-all border-2 border-dashed border-slate-200">
                                            {fullName ? (
                                                <span className="text-3xl font-black text-slate-900">{fullName.charAt(0)}</span>
                                            ) : (
                                                <User className="w-8 h-8" />
                                            )}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-1">صورة الحساب</h3>
                                        <p className="text-sm text-slate-500 font-medium">PNG أو JPG بحد أقصى 2MB.</p>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 mr-2">الاسم بالكامل</label>
                                            <div className="relative">
                                                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 mr-2">رقم الهاتف</label>
                                            <div className="relative">
                                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-emerald-500/50 transition-all text-slate-900 font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 mr-2">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                disabled
                                                value={email}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-6 outline-none text-slate-400 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mr-2 mt-1 font-bold italic">لا يمكن تغيير البريد الإلكتروني بعد توثيق الحساب.</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all"
                                    >
                                        <Save className="w-5 h-5" />
                                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                </div>
                            </div>

                            {/* Password Change Section */}
                            <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-200">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">كلمة المرور</h3>
                                    </div>
                                    <button className="text-emerald-600 font-black text-sm hover:underline">تغيير كلمة المرور</button>
                                </div>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    ننصحك باستخدام كلمة مرور قوية ومزيج من الأحرف والأرقام لضمان أمان حسابك وأموالك.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
