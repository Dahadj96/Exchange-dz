'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase/client';
import { Image as ImageIcon, Loader2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptUploaderProps {
    tradeId: string;
    onUploadComplete: (url: string) => void;
}

export const ReceiptUploader = ({ tradeId, onUploadComplete }: ReceiptUploaderProps) => {
    if (!supabase) return null;
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${tradeId}-${Math.random()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        try {
            const { error: uploadError, data } = await supabase.storage
                .from('receipts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('trades')
                .update({
                    receipt_url: publicUrl,
                    status: 'payment_sent'
                })
                .eq('id', tradeId);

            if (updateError) throw updateError;

            onUploadComplete(publicUrl);
        } catch (error: unknown) {
            console.error('Error uploading receipt:', error instanceof Error ? error.message : 'Unknown error');
            alert('فشل رفع الوصل. يرجى المحاولة مرة أخرى.');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence>
                {preview ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50"
                    >
                        <Image
                            src={preview}
                            alt="Receipt Preview"
                            fill
                            className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setPreview(null)}
                                className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                <span className="text-sm font-black text-slate-900">جاري الرفع...</span>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-[32px] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <p className="mb-2 text-sm text-slate-700 font-bold">تم التحويل - ارفـع الوصل</p>
                            <p className="text-xs text-slate-500">PNG, JPG (حد أقصى 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    </label>
                )}
            </AnimatePresence>
        </div>
    );
};
