'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CreditCard, Lock, Upload, Check, Camera, Mail, Key, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface SettingsViewProps {
    userId: string;
}

export const SettingsView = ({ userId }: SettingsViewProps) => {
    if (!supabase) return null;
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [baridiMobRIP, setBaridiMobRIP] = useState('');
    const [wiseEmail, setWiseEmail] = useState('');
    const [payseraEmail, setPayseraEmail] = useState('');
    const [redotPayId, setRedotPayId] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'none'>('none');

    // Notification preferences
    const [notifyOnNewMessage, setNotifyOnNewMessage] = useState(true);
    const [notifyOnTradeStatus, setNotifyOnTradeStatus] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setProfile(data);
            setDisplayName(data.full_name || '');
            setBaridiMobRIP(data.baridimob_rip || '');
            setWiseEmail(data.wise_email || '');
            setPayseraEmail(data.paysera_email || '');
            setRedotPayId(data.redotpay_id || '');
            setVerificationStatus(data.verification_status || 'none');
            setNotifyOnNewMessage(data.notify_on_new_message ?? true);
            setNotifyOnTradeStatus(data.notify_on_trade_status ?? true);
        }
        setIsLoading(false);
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: displayName,
                baridimob_rip: baridiMobRIP,
                wise_email: wiseEmail,
                paysera_email: payseraEmail,
                redotpay_id: redotPayId,
                notify_on_new_message: notifyOnNewMessage,
                notify_on_trade_status: notifyOnTradeStatus,
            })
            .eq('id', userId);

        if (!error) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }

        setIsSaving(false);
    };

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

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 mb-2">إعدادات الحساب</h2>
                <p className="text-slate-500 font-medium">إدارة معلومات حسابك وبيانات التحويل</p>
            </div>

            <div className="space-y-6 pb-8">
                {/* Identity Verification Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">التحقق من الهوية</h3>
                            <p className="text-sm text-slate-500 font-medium">رفع وثيقة الهوية للتحقق</p>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className={`p-4 rounded-2xl mb-6 ${verificationStatus === 'verified' ? 'bg-emerald-50 border border-emerald-200' :
                        verificationStatus === 'pending' ? 'bg-amber-50 border border-amber-200' :
                            'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {verificationStatus === 'verified' ? (
                                    <Check className="w-5 h-5 text-emerald-600" />
                                ) : verificationStatus === 'pending' ? (
                                    <Upload className="w-5 h-5 text-amber-600" />
                                ) : (
                                    <Shield className="w-5 h-5 text-slate-400" />
                                )}
                                <div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {verificationStatus === 'verified' ? 'تم التحقق من الهوية' :
                                            verificationStatus === 'pending' ? 'قيد المراجعة' :
                                                'لم يتم التحقق بعد'}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        {verificationStatus === 'verified' ? 'حسابك موثق بالكامل' :
                                            verificationStatus === 'pending' ? 'سيتم المراجعة خلال 24 ساعة' :
                                                'قم برفع صورة بطاقة الهوية أو جواز السفر'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Button */}
                    {verificationStatus !== 'verified' && (
                        <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                            <Upload className="w-5 h-5" />
                            رفع وثيقة الهوية
                        </button>
                    )}
                </motion.div>

                {/* Transfer Information Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">معلومات التحويل</h3>
                            <p className="text-sm text-slate-500 font-medium">احفظ بياناتك لتسهيل عمليات التحويل</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* BaridiMob RIP */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                رقم RIP - BaridiMob
                            </label>
                            <input
                                type="text"
                                value={baridiMobRIP}
                                onChange={(e) => setBaridiMobRIP(e.target.value)}
                                placeholder="أدخل 20 رقم"
                                maxLength={20}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <p className="text-xs text-slate-500 mt-2 font-medium">20 رقم فقط</p>
                        </div>

                        {/* Wise Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-600" />
                                البريد الإلكتروني - Wise
                            </label>
                            <input
                                type="email"
                                value={wiseEmail}
                                onChange={(e) => setWiseEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        {/* Paysera Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-600" />
                                البريد الإلكتروني - Paysera
                            </label>
                            <input
                                type="email"
                                value={payseraEmail}
                                onChange={(e) => setPayseraEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        {/* RedotPay ID */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Key className="w-4 h-4 text-slate-600" />
                                معرّف المستخدم - RedotPay
                            </label>
                            <input
                                type="text"
                                value={redotPayId}
                                onChange={(e) => setRedotPayId(e.target.value)}
                                placeholder="أدخل معرّف RedotPay"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Notification Preferences Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                            <Bell className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">تفضيلات الإشعارات</h3>
                            <p className="text-sm text-slate-500 font-medium">إدارة الإشعارات التي تريد استلامها</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* New Messages Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                {notifyOnNewMessage ? (
                                    <Bell className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <BellOff className="w-5 h-5 text-slate-400" />
                                )}
                                <div>
                                    <div className="text-sm font-bold text-slate-900">تنبيهات الرسائل الجديدة</div>
                                    <div className="text-xs text-slate-500 font-medium">احصل على إشعار عند استلام رسالة جديدة</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifyOnNewMessage(!notifyOnNewMessage)}
                                className={`
                                    relative w-14 h-7 rounded-full transition-colors
                                    ${notifyOnNewMessage ? 'bg-emerald-500' : 'bg-slate-300'}
                                `}
                            >
                                <motion.div
                                    animate={{ x: notifyOnNewMessage ? 28 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="absolute top-0.5 right-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                                />
                            </button>
                        </div>

                        {/* Trade Status Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                {notifyOnTradeStatus ? (
                                    <Bell className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <BellOff className="w-5 h-5 text-slate-400" />
                                )}
                                <div>
                                    <div className="text-sm font-bold text-slate-900">تنبيهات حالة الصفقة</div>
                                    <div className="text-xs text-slate-500 font-medium">احصل على إشعار عند تحديث حالة التداول</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifyOnTradeStatus(!notifyOnTradeStatus)}
                                className={`
                                    relative w-14 h-7 rounded-full transition-colors
                                    ${notifyOnTradeStatus ? 'bg-emerald-500' : 'bg-slate-300'}
                                `}
                            >
                                <motion.div
                                    animate={{ x: notifyOnTradeStatus ? 28 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="absolute top-0.5 right-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Management Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">إدارة الملف الشخصي</h3>
                            <p className="text-sm text-slate-500 font-medium">تحديث معلوماتك الشخصية</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Profile Picture */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-3">صورة الملف الشخصي</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-3xl shadow-lg">
                                    {displayName.charAt(0) || 'U'}
                                </div>
                                <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all flex items-center gap-2">
                                    <Camera className="w-4 h-4" />
                                    تغيير الصورة
                                </button>
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">الاسم المعروض</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="أدخل اسمك"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        {/* Change Password Button */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">كلمة المرور</label>
                            <button className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-900 font-bold transition-all flex items-center justify-between">
                                <span>تغيير كلمة المرور</span>
                                <Lock className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="sticky bottom-0 bg-slate-50 pt-4 pb-4"
                >
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${saveSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
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
                </motion.div>
            </div>
        </div>
    );
};
