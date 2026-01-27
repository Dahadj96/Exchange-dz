'use client';

import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface Step {
    number: number;
    title: string;
    description: string;
}

interface StatusStepperProps {
    currentStep: number;
}

const steps: Step[] = [
    {
        number: 1,
        title: 'البدء والاتفاق',
        description: 'الاتفاق على تفاصيل التحويل',
    },
    {
        number: 2,
        title: 'رفع الإثبات',
        description: 'رفع وصل أو لقطة شاشة التحويل',
    },
    {
        number: 3,
        title: 'التأكيد النهائي',
        description: 'تأكيد الطرفين وإتمام العملية',
    },
];

export const StatusStepper = ({ currentStep }: StatusStepperProps) => {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">حالة العملية</h3>

            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 right-6 left-6 h-1 bg-slate-200 rounded-full" style={{ zIndex: 0 }}>
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between" style={{ zIndex: 1 }}>
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;
                        const isPending = stepNumber > currentStep;

                        return (
                            <div key={step.number} className="flex flex-col items-center" style={{ flex: 1 }}>
                                {/* Step Circle */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 relative
                                    ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : ''}
                                    ${isCurrent ? 'bg-emerald-100 text-emerald-600 border-4 border-emerald-500 shadow-lg shadow-emerald-500/20' : ''}
                                    ${isPending ? 'bg-slate-100 text-slate-400 border-2 border-slate-200' : ''}
                                `}>
                                    {isCompleted && <CheckCircle className="w-6 h-6" />}
                                    {isCurrent && <Clock className="w-6 h-6 animate-pulse" />}
                                    {isPending && <Circle className="w-6 h-6" />}
                                </div>

                                {/* Step Info */}
                                <div className="text-center max-w-[120px]">
                                    <div className={`
                                        text-sm font-black mb-1
                                        ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}
                                    `}>
                                        {step.title}
                                    </div>
                                    <div className={`
                                        text-xs font-medium
                                        ${isCompleted || isCurrent ? 'text-slate-500' : 'text-slate-400'}
                                    `}>
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current Step Indicator */}
            <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-emerald-900">
                            {steps[currentStep - 1]?.title}
                        </div>
                        <div className="text-xs text-emerald-700 font-medium">
                            {steps[currentStep - 1]?.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
