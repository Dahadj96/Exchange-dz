'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Phone, MapPin, Shield, Save, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DashboardSettingsProps {
    userId: string;
}

export const DashboardSettings = ({ userId }: DashboardSettingsProps) => {
    if (!supabase) return null;
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        location: '',
    });

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: { user } } = await supabase.auth.getUser();

        if (profileData) {
            setProfile(profileData);
            setFormData({
                full_name: profileData.full_name || '',
                email: user?.email || '',
                phone: profileData.phone || '',
                location: profileData.location || '',
            });
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    location: formData.location,
                })
                .eq('id', userId);

            if (!error) {
                // Refresh profile data
                await fetchProfile();
                alert('تم حفظ التغييرات بنجاح!');
            } else {
                alert('حدث خطأ أثناء الحفظ');
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            alert('حدث خطأ أثناء الحفظ');
        }
        setIsSaving(false);
    };

    const handleBackToDashboard = () => {
        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20" dir="rtl">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header with Back Button */}
                <div className="mb-8">
                    <button
                        onClick={handleBackToDashboard}
                        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-4"
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span className="text-sm font-bold">العودة إلى لوحة التحكم</span>
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">إعدادات الملف الشخصي</h1>
                    <p className="text-slate-600 font-medium">قم بتحديث معلوماتك الشخصية وإعدادات حسابك</p>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
                >
                    {/* Avatar Section */}
                    <div className="p-8 bg-gradient-to-br from-emerald-50 to-blue-50 border-b border-slate-200">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-emerald-600/30">
                                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border-2 border-slate-100">
                                    <Camera className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mt-4">{profile?.full_name || 'مستخدم جديد'}</h2>
                            {profile?.is_verified && (
                                <div className="flex items-center gap-1 text-emerald-600 mt-2">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-xs font-black">عضو موثق</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                                <User className="w-4 h-4 text-slate-600" />
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="أدخل اسمك الكامل"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                                <Mail className="w-4 h-4 text-slate-600" />
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1 mr-1">لا يمكن تغيير البريد الإلكتروني</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                                <Phone className="w-4 h-4 text-slate-600" />
                                رقم الهاتف
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="أدخل رقم هاتفك"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                                <MapPin className="w-4 h-4 text-slate-600" />
                                الموقع
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="أدخل موقعك"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 font-bold mb-1">السمعة</div>
                        <div className="text-2xl font-black text-slate-900">{profile?.success_rate || 100}%</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 font-bold mb-1">إجمالي العمليات</div>
                        <div className="text-2xl font-black text-slate-900">{profile?.total_trades || 0}</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 font-bold mb-1">حالة الحساب</div>
                        <div className="text-2xl font-black text-emerald-600">
                            {profile?.is_verified ? 'موثق' : 'نشط'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
