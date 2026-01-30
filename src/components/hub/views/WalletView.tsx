'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, CreditCard, Edit2, Check } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export const WalletView = () => {
    if (!supabase) return null;
    const [baridiMobRIP, setBaridiMobRIP] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [tempRIP, setTempRIP] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('profiles')
            .select('baridimob_rip')
            .eq('id', user.id)
            .single();

        if (data) {
            setBaridiMobRIP((data as any).baridimob_rip || '');
            setTempRIP((data as any).baridimob_rip || '');
        }
    };

    const handleSave = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('profiles')
            .update({ baridimob_rip: tempRIP })
            .eq('id', user.id);

        setBaridiMobRIP(tempRIP);
        setIsEditing(false);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 mb-2">المحفظة</h2>
                <p className="text-slate-500 font-medium">إدارة طرق الدفع والمعلومات المالية</p>
            </div>

            <div className="space-y-6">
                {/* BaridiMob RIP Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm font-medium opacity-90">BaridiMob</div>
                                <div className="text-xs opacity-75">رقم التعريف الشخصي</div>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {!isEditing ? (
                        <div className="text-3xl font-black tracking-wider">
                            {baridiMobRIP || '••• ••• •••'}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={tempRIP}
                            onChange={(e) => setTempRIP(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/50 font-black text-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="أدخل RIP الخاص بك"
                        />
                    )}
                </motion.div>

                {/* Payment Methods */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-6">طرق الدفع</h3>
                    <div className="space-y-4">
                        {['Wise', 'RedotPay', 'Paysera'].map((method, index) => (
                            <div
                                key={method}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-black text-slate-600">
                                        {method[0]}
                                    </div>
                                    <span className="font-bold text-slate-900">{method}</span>
                                </div>
                                <button className="text-sm font-bold text-emerald-600 hover:underline">
                                    إضافة
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
