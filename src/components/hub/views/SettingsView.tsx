'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CreditCard, Lock, Upload, Check, Mail, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { PaymentMethodsSection } from './PaymentMethodsSection';
import { useUser } from '@/context/UserProvider';

interface SettingsViewProps {
    userId: string;
}

export const SettingsView = ({ userId }: SettingsViewProps) => {
    if (!supabase) return null;
    const { refreshProfile } = useUser();

    // 1. Unified State
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 2. Add avatar_url to state
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        phone: '',
        city: '',
        avatar_url: '',
        verification_status: 'unverified',
        notify_on_new_message: true,
        notify_on_trade_status: true
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setFormData({
                    username: data.username || '',
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    city: data.city || '',
                    avatar_url: data.avatar_url || '',
                    verification_status: data.verification_status || 'unverified',
                    notify_on_new_message: data.notify_on_new_message ?? true,
                    notify_on_trade_status: data.notify_on_trade_status ?? true,
                });
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, [userId]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `public/${userId}-${Date.now()}.${fileExt}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile Logic
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 4. Update Local State & Global Context
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            await refreshProfile(); // <--- Refresh global context
            alert('تم تحديث الصورة بنجاح!');

        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert('حدث خطأ أثناء رفع الصورة: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        const sanitizedUsername = formData.username?.trim();
        if (!sanitizedUsername) {
            alert('Username cannot be empty');
            setIsSaving(false);
            return;
        }

        // 4. Logic: Update only valid fields to avoid 400 error
        const updates = {
            username: sanitizedUsername,
            full_name: formData.full_name,
            phone: formData.phone,
            city: formData.city,
            // avatar_url is updated separately via handleImageUpload
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (!error) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            console.error('Error updating profile:', error.message);
            alert(`Error updating profile: ${error.message}`);
        }
        setIsSaving(false);
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // 3. Tabs Definition
    const tabs = [
        { id: 'general', label: 'عام', icon: User },
        { id: 'verification', label: 'التحقق', icon: Shield },
        { id: 'payment', label: 'طرق الدفع', icon: CreditCard },
        { id: 'notifications', label: 'الإشعارات', icon: Bell },
        { id: 'security', label: 'الأمان', icon: Lock },
    ];

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // 1. SyntaxFix: Ensure function properly wraps return
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 mb-2">إعدادات الحساب</h2>
                <p className="text-slate-500 font-medium">إدارة ملفك الشخصي وتفضيلاتك</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                                ${isActive
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6 pb-24">
                {/* General Tab */}
                {activeTab === 'general' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-2xl overflow-hidden relative">
                                    {formData.avatar_url ? (
                                        <img
                                            src={formData.avatar_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        (formData.username || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">صورة الملف الشخصي</div>
                                    <div className="text-sm text-slate-500">تظهر هذه الصورة للمستخدمين الآخرين</div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="mr-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {isUploading ? 'جاري الرفع...' : 'تغيير'}
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => updateField('full_name', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="الاسم واللقب"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">اسم المستخدم</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => updateField('username', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="05XXXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">المدينة</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="الجزائر العاصمة"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Verification Tab */}
                {activeTab === 'verification' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">حالة التحقق</h3>
                                <p className="text-slate-500">رفع الوثائق المطلوبة لتأكيد هويتك</p>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl flex items-center justify-between mb-6 ${formData.verification_status === 'verified' ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'
                            }`}>
                            <div className="flex items-center gap-4">
                                {formData.verification_status === 'verified' ? (
                                    <Check className="w-6 h-6 text-emerald-600" />
                                ) : (
                                    <Shield className="w-6 h-6 text-slate-400" />
                                )}
                                <div>
                                    <div className="font-bold text-slate-900">
                                        {formData.verification_status === 'verified' ? 'تم التحقق' : 'لم يتم التحقق'}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {formData.verification_status === 'verified' ? 'حسابك جاهز للتداول' : 'يرجى رفع صورة بطاقة التعريف'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                            <Upload className="w-10 h-10 text-slate-400 mb-4" />
                            <div className="font-bold text-slate-900 mb-1">اضغط لرفع الوثيقة</div>
                            <div className="text-sm text-slate-500">PNG, JPG حتى 5MB</div>
                        </div>
                    </motion.div>
                )}

                {/* 5. Payment Methods Tab */}
                {activeTab === 'payment' && (
                    <PaymentMethodsSection userId={userId} userFullName={formData.full_name} />
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4"
                    >
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Mail className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">تنبيهات البريد الإلكتروني</div>
                                    <div className="text-sm text-slate-500">استلام إشعارات عند وجود رسائل جديدة</div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateField('notify_on_new_message', !formData.notify_on_new_message)}
                                className={`w-14 h-8 rounded-full transition-colors relative ${formData.notify_on_new_message ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <motion.div
                                    animate={{ x: formData.notify_on_new_message ? 26 : 2 }}
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                        {/* Other notifications will be added in future updates to keep code clean */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Bell className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">تحديثات الصفقات</div>
                                    <div className="text-sm text-slate-500">إشعار عند تغيير حالة الصفقة</div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateField('notify_on_trade_status', !formData.notify_on_trade_status)}
                                className={`w-14 h-8 rounded-full transition-colors relative ${formData.notify_on_trade_status ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <motion.div
                                    animate={{ x: formData.notify_on_trade_status ? 26 : 2 }}
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6"
                    >
                        <h3 className="font-black text-xl text-slate-900 mb-4">تغيير كلمة المرور</h3>
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">كلمة المرور الحالية</label>
                            <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">كلمة المرور الجديدة</label>
                            <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">
                            تحديث كلمة المرور
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky bottom-0 bg-slate-50 pt-4 pb-4 border-t border-slate-200 mt-auto"
            >
                <div className="container mx-auto">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${saveSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="w-6 h-6" />
                                تم الحفظ بنجاح
                            </>
                        ) : (
                            'حفظ التغييرات'
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
