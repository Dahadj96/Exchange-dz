'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

interface NotificationDropdownProps {
    userId: string;
}

interface Notification {
    id: string;
    title: string;
    content: string;
    type: 'message' | 'trade' | 'system';
    is_read: boolean;
    link: string | null;
    created_at: string;
}

export const NotificationDropdown = ({ userId }: NotificationDropdownProps) => {
    if (!supabase) return null;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [tableExists, setTableExists] = useState(true);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Subscribe to real-time notifications
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    // console.log('Realtime notification received:', payload); // Debug log
                    const newNotification = payload.new as Notification;
                    setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
                    setUnreadCount((prev) => prev + 1);

                    // Trigger shake animation
                    setHasNewNotification(true);
                    setTimeout(() => setHasNewNotification(false), 1000);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const updatedNotification = payload.new as Notification;
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
                    );
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                // console.log removed
                setTableExists(false);
            } else if (data) {
                setNotifications(data);
                setTableExists(true);
            }
        } catch (err) {
            // console.log removed
            setTableExists(false);
        }
        setIsLoading(false);
    };

    const fetchUnreadCount = async () => {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (!error && count !== null) {
                setUnreadCount(count);
            }
        } catch (err) {
            // console.log removed
        }
    };

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    };

    const markAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        if (notification.link) {
            window.location.href = notification.link;
        }

        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return <MessageSquare className="w-4 h-4 text-blue-600" />;
            case 'trade':
                return <TrendingUp className="w-4 h-4 text-emerald-600" />;
            case 'system':
                return <AlertCircle className="w-4 h-4 text-amber-600" />;
            default:
                return <Bell className="w-4 h-4 text-slate-600" />;
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        return `منذ ${diffDays} يوم`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={hasNewNotification ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative p-2.5 hover:bg-slate-100 rounded-2xl transition-colors"
                aria-label="الإشعارات"
            >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
                    >
                        <span className="text-xs font-black text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </motion.div>
                )}
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel - RIGHT-0 ORIGIN-TOP-RIGHT (Opens toward LEFT) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 origin-top-right top-full mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl z-[100] overflow-hidden"
                            style={{ maxWidth: 'calc(100vw - 2rem)' }}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-slate-900" />
                                    <h3 className="font-black text-slate-900">الإشعارات</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                            {unreadCount} جديد
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            تعليم الكل كمقروء
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {!tableExists ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <p className="text-slate-900 font-bold mb-2">جدول الإشعارات غير موجود</p>
                                        <p className="text-sm text-slate-500 font-medium">
                                            يرجى تشغيل ملف SQL لإنشاء جدول الإشعارات
                                        </p>
                                    </div>
                                ) : isLoading ? (
                                    <div className="p-8 text-center">
                                        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 font-medium">جاري التحميل...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Bell className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">لا توجد إشعارات</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`p-4 transition-all cursor-pointer ${notification.is_read
                                                    ? 'hover:bg-slate-50'
                                                    : 'bg-emerald-50/50 hover:bg-emerald-50'
                                                    }`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.is_read ? 'bg-slate-100' : 'bg-white'
                                                            }`}
                                                    >
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="text-sm font-bold text-slate-900">
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.is_read && (
                                                                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-600 font-medium mb-1 line-clamp-2">
                                                            {notification.content}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-medium">
                                                            {getTimeAgo(notification.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-slate-200 bg-white/50">
                                    <button
                                        onClick={() => {
                                            window.location.href = '/dashboard';
                                            setIsOpen(false);
                                        }}
                                        className="w-full py-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        عرض جميع الإشعارات
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
