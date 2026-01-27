'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, ArrowDown } from 'lucide-react';

export const LegalDisclaimerModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if user has already agreed
        const hasAgreed = localStorage.getItem('assetbridge_legal_agreed');

        if (!hasAgreed) {
            setIsOpen(true);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleAgree = () => {
        if (!hasScrolledToBottom) return;

        // Store agreement in localStorage
        localStorage.setItem('assetbridge_legal_agreed', 'true');
        setIsOpen(false);
        // Restore body scroll
        document.body.style.overflow = 'unset';
    };

    // Check if user has scrolled to bottom
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

        if (isAtBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    // Prevent closing on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown, true);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Premium Backdrop - Heavy Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-lg z-[100]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-lg h-[600px] lg:h-[80vh] max-h-[700px]"
                        >
                            {/* Glassmorphism Card */}
                            <div className="h-full bg-white/90 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">

                                {/* ========== FIXED HEADER (Top Zone) ========== */}
                                <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-slate-200/50">
                                    {/* Warning Icon */}
                                    <div className="flex justify-center mb-5">
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl font-black text-slate-900 text-center mb-2" dir="rtl">
                                        إخلاء المسؤولية والشروط
                                    </h2>

                                    {/* Subtitle */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                        <p className="text-sm font-bold text-emerald-600">Legal Disclaimer & Terms</p>
                                    </div>
                                </div>

                                {/* ========== SCROLLABLE CONTENT (Middle Zone) ========== */}
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-slate-100"
                                    style={{
                                        maskImage: hasScrolledToBottom
                                            ? 'none'
                                            : 'linear-gradient(to bottom, black 80%, transparent 100%)',
                                        WebkitMaskImage: hasScrolledToBottom
                                            ? 'none'
                                            : 'linear-gradient(to bottom, black 80%, transparent 100%)',
                                    }}
                                    dir="rtl"
                                >
                                    {/* Main Legal Text */}
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 mb-5">
                                        <p className="text-slate-700 leading-relaxed text-base font-medium text-right">
                                            هذا الموقع هو عبارة عن <strong className="text-slate-900">وسيط تقني</strong> لتسهيل تبادل المعلومات بين الأفراد فقط. نحن <strong className="text-red-600">لا نقدم أي خدمات مالية، مصرفية، أو صرافة عملات</strong>. جميع التعاملات تتم على <strong className="text-slate-900">مسؤولية المستخدمين الشخصية</strong>، والمنصة <strong className="text-red-600">غير مسؤولة</strong> عن أي اتفاقات خارجية.
                                        </p>

                                        {/* English Translation */}
                                        <div className="mt-4 pt-4 border-t border-slate-300">
                                            <p className="text-slate-600 leading-relaxed text-sm font-medium" dir="ltr">
                                                This website is a <strong className="text-slate-900">technical intermediary</strong> to facilitate information exchange between individuals only. We <strong className="text-red-600">do not provide any financial, banking, or currency exchange services</strong>. All transactions are the <strong className="text-slate-900">personal responsibility of users</strong>, and the platform is <strong className="text-red-600">not responsible</strong> for any external agreements.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Terms Section */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 mb-5">
                                        <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            شروط الاستخدام
                                        </h3>
                                        <ul className="space-y-2 text-slate-700 text-sm font-medium">
                                            <li className="flex items-start gap-2">
                                                <span className="text-emerald-600 mt-1">•</span>
                                                <span>يجب أن تكون فوق 18 عامًا لاستخدام هذه المنصة</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-emerald-600 mt-1">•</span>
                                                <span>أنت مسؤول عن التحقق من هوية الطرف الآخر قبل أي تعامل</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-emerald-600 mt-1">•</span>
                                                <span>المنصة لا تضمن أي معاملات أو تحويلات مالية</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-emerald-600 mt-1">•</span>
                                                <span>استخدامك للموقع يعني موافقتك على جميع الشروط</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Important Warning */}
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 rounded-2xl p-5 mb-5">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-amber-900 font-bold text-sm leading-relaxed mb-2">
                                                    <strong>تنبيه مهم:</strong> يجب عليك قراءة هذا الإخلاء بالكامل والتمرير إلى الأسفل لتفعيل زر الموافقة.
                                                </p>
                                                <p className="text-amber-800 text-xs">
                                                    <strong>Important:</strong> You must read this disclaimer completely and scroll to the bottom to enable the accept button.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Warning */}
                                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl p-5">
                                        <h3 className="text-base font-black text-red-900 mb-2">تحذير من المخاطر</h3>
                                        <p className="text-red-800 text-sm leading-relaxed font-medium">
                                            تداول الأصول الرقمية والعملات ينطوي على مخاطر عالية. قد تخسر كامل رأس مالك. تأكد من فهمك الكامل للمخاطر قبل المتابعة.
                                        </p>
                                        <p className="text-red-700 text-xs mt-2" dir="ltr">
                                            Trading digital assets and currencies involves high risk. You may lose your entire capital. Ensure you fully understand the risks before proceeding.
                                        </p>
                                    </div>

                                    {/* Scroll Indicator (only shown if not at bottom) */}
                                    {!hasScrolledToBottom && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-center mt-6 mb-2"
                                        >
                                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                                                <ArrowDown className="w-4 h-4 animate-bounce" />
                                                <span>مرر للأسفل للمتابعة</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* ========== FIXED FOOTER (Bottom Zone) ========== */}
                                <div className="flex-shrink-0 px-8 pb-8 pt-6 border-t border-slate-200/50 bg-gradient-to-b from-transparent to-slate-50/50">
                                    {/* Agreement Button */}
                                    <button
                                        onClick={handleAgree}
                                        disabled={!hasScrolledToBottom}
                                        className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group ${hasScrolledToBottom
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/40 cursor-pointer'
                                                : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        <CheckCircle className={`w-5 h-5 transition-transform ${hasScrolledToBottom ? 'group-hover:scale-110' : ''}`} />
                                        <span>أوافق وأبدأ التداول</span>
                                        <span className="text-sm font-medium opacity-90">I Agree & Start Trading</span>
                                    </button>

                                    {/* Status Text */}
                                    <p className="text-center text-slate-400 text-xs mt-3 font-medium">
                                        {hasScrolledToBottom ? (
                                            <>
                                                ✓ لقد قرأت وفهمت جميع الشروط
                                                <br />
                                                You have read and understood all terms
                                            </>
                                        ) : (
                                            <>
                                                يرجى التمرير لأسفل لقراءة جميع الشروط
                                                <br />
                                                Please scroll down to read all terms
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
