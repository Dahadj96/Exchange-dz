'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';

export const QuickActions = () => {
    const actions = [
        {
            icon: Plus,
            label: 'إنشاء عرض جديد',
            description: 'أضف عرض تحويل أصول',
            href: '/dashboard/create',
            color: 'emerald',
            gradient: 'from-emerald-500 to-emerald-600',
        },
        {
            icon: ShoppingBag,
            label: 'تصفح السوق',
            description: 'ابحث عن عروض جديدة',
            href: '/marketplace',
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            icon: Eye,
            label: 'عرض كل التداولات',
            description: 'تاريخ التداولات الكامل',
            href: '/dashboard/trades',
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
        >
            <h3 className="text-xl font-black text-slate-900 mb-6">إجراءات سريعة</h3>

            <div className="space-y-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Link key={index} href={action.href}>
                            <motion.div
                                whileHover={{ scale: 1.02, x: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg shadow-${action.color}-600/20 group-hover:shadow-xl group-hover:shadow-${action.color}-600/30 transition-all`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-slate-900 mb-1">{action.label}</div>
                                        <div className="text-xs text-slate-500 font-medium">{action.description}</div>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
};
