'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Wallet, PackageCheck, MessageSquare, FileCheck, ShieldCheck } from 'lucide-react';

interface StatusStepperProps {
    currentStep: number;
}

export const StatusStepper = ({ currentStep }: StatusStepperProps) => {
    const steps = [
        { id: 1, name: 'الاتفاق', icon: MessageSquare, description: 'بدء المحادثة' },
        { id: 2, name: 'الدفع', icon: Wallet, description: 'إرسال واستلام بالدفع' },
        { id: 3, name: 'التأكيد', icon: FileCheck, description: 'تأكيد الدفع' },
        { id: 4, name: 'الاستلام', icon: ShieldCheck, description: 'تحرير الأصول' },
    ];

    return (
        <div className="py-8 border-b border-slate-100 mb-8 font-cairo">
            <div className="flex justify-between relative">
                {/* Connection Line */}
                <div className="absolute top-6 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    className="absolute top-6 left-0 h-0.5 bg-emerald-500 -z-10 transition-all duration-500"
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3 bg-white/50 px-2">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isCompleted ? '#10b981' : isActive ? '#ffffff' : '#f8fafc',
                                    borderColor: isCompleted || isActive ? '#10b981' : '#e2e8f0',
                                }}
                                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-colors shadow-sm`}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6 text-white" />
                                ) : (
                                    <Icon className={`w-6 h-6 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                )}
                            </motion.div>
                            <div className="text-center">
                                <div className={`text-[11px] font-black uppercase tracking-wider mb-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {step.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold hidden sm:block">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
