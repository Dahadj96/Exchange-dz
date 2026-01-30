
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { usePaymentMethods, PaymentMethod } from '@/hooks/usePaymentMethods';

export const PaymentMethodsSection = ({ userId, userFullName }: { userId: string; userFullName: string }) => {
    const { methods, loading, error, addMethod, deleteMethod } = usePaymentMethods(userId);
    const [isAdding, setIsAdding] = useState(false);
    const [newMethod, setNewMethod] = useState({
        provider: 'CCP' as const,
        account_identifier: '',
    });

    const handleAdd = async () => {
        if (!newMethod.account_identifier) return;
        if (!userFullName) {
            alert('يجب عليك إكمال ملفك الشخصي (الاسم الكامل) قبل إضافة طرق دفع.');
            return;
        }

        // We do NOT send holder_name to the database anymore.
        // It is inferred from the profile.
        const methodToAdd = {
            provider: newMethod.provider,
            account_identifier: newMethod.account_identifier
        };

        const { error } = await addMethod(methodToAdd);
        if (!error) {
            setIsAdding(false);
            setNewMethod({ provider: 'CCP', account_identifier: '' });
        } else {
            alert('Error adding method: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            await deleteMethod(id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900">طرق الدفع</h3>
                    <p className="text-slate-500">إدارة حساباتك المالية لاستقبال الأموال</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    إضافة حساب
                </button>
            </div>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-50 border border-emerald-200 rounded-2xl p-6 space-y-4"
                >
                    <h4 className="font-bold text-slate-900">إضافة حساب جديد</h4>

                    {/* Security Notice */}
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        سيتم ربط هذا الحساب باسمك الموثق تلقائياً: {userFullName || '(يرجى إكمال الملف الشخصي)'}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">المزود</label>
                            <select
                                value={newMethod.provider}
                                onChange={(e) => setNewMethod({ ...newMethod, provider: e.target.value as any })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                            >
                                <option value="CCP">Boite Postale (CCP)</option>
                                <option value="BaridiMob">BaridiMob</option>
                                <option value="Wise">Wise</option>
                                <option value="Paysera">Paysera</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">رقم الحساب / الإيميل</label>
                            <input
                                type="text"
                                value={newMethod.account_identifier}
                                onChange={(e) => setNewMethod({ ...newMethod, account_identifier: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl"
                                placeholder="RIP / Email"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg font-bold"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleAdd}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                        >
                            حفظ الحساب
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
                ) : methods.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">لا توجد طرق دفع مضافة بعد</p>
                    </div>
                ) : (
                    methods.map((method) => (
                        <div key={method.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black">
                                    {method.provider === 'CCP' ? 'CCP' : method.provider.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{method.provider}</div>
                                    <div className="text-sm text-slate-500 font-mono">{method.account_identifier}</div>
                                    {/* Display global userFullName, ignoring DB field */}
                                    <div className="text-xs text-slate-400">{userFullName}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(method.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};
