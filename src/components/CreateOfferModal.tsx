'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wallet, Banknote, Globe, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Listing, PlatformType, SupportedCurrency } from '@/types';

interface CreateOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userId: string;
}

const PLATFORMS: { id: PlatformType; label: string; currencies: SupportedCurrency[] }[] = [
    { id: 'Wise', label: 'Wise', currencies: ['EUR', 'USD', 'GBP'] },
    { id: 'Paysera', label: 'Paysera', currencies: ['EUR'] },
    { id: 'RedotPay', label: 'RedotPay', currencies: ['USD'] },
    { id: 'USDT', label: 'USDT (Tether)', currencies: ['USD'] },
    { id: 'Payoneer', label: 'Payoneer', currencies: ['USD', 'EUR', 'GBP'] },
    { id: 'Skrill', label: 'Skrill', currencies: ['USD', 'EUR'] },
];

export const CreateOfferModal = ({ isOpen, onClose, onSuccess, userId }: CreateOfferModalProps) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
    const [formData, setFormData] = useState({
        currency_code: '' as SupportedCurrency | '',
        rate: '',
        stock: '',
        min_amount: '',
        max_amount: '',
    });

    const handlePlatformSelect = (platform: PlatformType) => {
        setSelectedPlatform(platform);
        // Reset currency if not supported by new platform
        const platformConfig = PLATFORMS.find(p => p.id === platform);
        if (platformConfig && formData.currency_code && !platformConfig.currencies.includes(formData.currency_code as SupportedCurrency)) {
            setFormData(prev => ({ ...prev, currency_code: '' }));
        }
        // Auto-select currency if only one option
        if (platformConfig && platformConfig.currencies.length === 1) {
            setFormData(prev => ({ ...prev, currency_code: platformConfig.currencies[0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!selectedPlatform || !formData.currency_code) {
            setError('يرجى اختيار المنصة والعملة');
            setIsLoading(false);
            return;
        }

        try {
            const { error: submitError } = await supabase.from('offers').insert({
                user_id: userId,
                platform: selectedPlatform,
                currency_code: formData.currency_code,
                rate: parseFloat(formData.rate),
                stock: parseFloat(formData.stock),
                min_amount: parseFloat(formData.min_amount),
                max_amount: parseFloat(formData.max_amount),
                is_active: true,
            });

            if (submitError) throw submitError;

            onSuccess?.();
            onClose();
            // Reset form
            setStep(1);
            setSelectedPlatform(null);
            setFormData({
                currency_code: '',
                rate: '',
                stock: '',
                min_amount: '',
                max_amount: '',
            });
        } catch (err: any) {
            console.error('Error creating offer (Full):', err);

            // Extract Supabase-specific error info
            const code = err.code || 'UNKNOWN';
            const message = err.message || 'حدث خطأ غير متوقع';
            const details = err.details || '';
            const hint = err.hint || '';

            console.error(`Supabase Error [${code}]: ${message}`, { details, hint });

            setError(`خطأ (${code}): ${message}${details ? ' - ' + details : ''}`);
        } finally {
            setIsLoading(false);
        }
    };

    const availableCurrencies = selectedPlatform
        ? PLATFORMS.find(p => p.id === selectedPlatform)?.currencies || []
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl pointer-events-auto overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">إنشاء عرض جديد</h2>
                                    <p className="text-sm text-slate-500 font-medium">خطوة {step} من 2</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                {step === 1 ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-900">المنصة</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {PLATFORMS.map((platform) => (
                                                    <button
                                                        key={platform.id}
                                                        onClick={() => handlePlatformSelect(platform.id)}
                                                        className={`p-4 rounded-2xl border-2 transition-all text-right group ${selectedPlatform === platform.id
                                                            ? 'border-emerald-500 bg-emerald-50'
                                                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span className={`block font-black mb-1 ${selectedPlatform === platform.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                            {platform.label}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium group-hover:text-emerald-600/70">
                                                            يدعم: {platform.currencies.join(', ')}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedPlatform && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-4"
                                            >
                                                <label className="text-sm font-bold text-slate-900">العملة</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableCurrencies.map((curr) => (
                                                        <button
                                                            key={curr}
                                                            onClick={() => setFormData({ ...formData, currency_code: curr })}
                                                            className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${formData.currency_code === curr
                                                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                                : 'border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                                                                }`}
                                                        >
                                                            {curr}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!selectedPlatform || !formData.currency_code}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            المتابعة
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Rate Input */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                                سعر الصرف (DZD لكل 1 {formData.currency_code})
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    value={formData.rate}
                                                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    placeholder="مثال: 245.5"
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                                                    DZD
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500 font-medium">
                                                السعر السوقي الحالي: <span className="text-emerald-600 font-bold">240.00 DZD</span>
                                            </p>
                                        </div>

                                        {/* Amount Input */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                                الكمية المتاحة للبيع
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    placeholder="0.00"
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                                                    {formData.currency_code}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Limits */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-900 mb-2">الحد الأدنى</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        required
                                                        step="0.01"
                                                        value={formData.min_amount}
                                                        onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        placeholder="0.00"
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                                        {formData.currency_code}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-900 mb-2">الحد الأقصى</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        required
                                                        step="0.01"
                                                        value={formData.max_amount}
                                                        onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                        placeholder="0.00"
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                                        {formData.currency_code}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary Card */}
                                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Banknote className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-bold text-blue-900">ملخص العرض</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600">إجمالي القيمة (DZD):</span>
                                                <span className="font-black text-slate-900">
                                                    {((parseFloat(formData.stock || '0') * parseFloat(formData.rate || '0'))).toLocaleString()} DZD
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                            >
                                                رجوع
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? 'جاري النشر...' : 'نشر العرض'}
                                                {!isLoading && <Check className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
