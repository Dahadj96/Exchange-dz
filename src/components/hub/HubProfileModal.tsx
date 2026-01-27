'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { HubContextPanel } from './HubContextPanel';

interface HubProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const HubProfileModal = ({ isOpen, onClose, userId }: HubProfileModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-slate-50 rounded-t-[40px] z-50 max-h-[85vh] overflow-y-auto lg:hidden"
                    >
                        {/* Handle Bar */}
                        <div className="sticky top-0 bg-slate-50 pt-4 pb-2 px-6 border-b border-slate-200">
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">الملف الشخصي</h3>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <HubContextPanel userId={userId} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
