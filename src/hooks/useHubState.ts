'use client';

import { useState, useEffect, useCallback } from 'react';

export type HubView = 'marketplace' | 'my-trades' | 'my-offers' | 'settings' | 'trade-room';

interface HubState {
    activeView: HubView;
    selectedTradeId: string | null;
    notificationCount: number;
}

export const useHubState = () => {
    const [state, setState] = useState<HubState>({
        activeView: 'marketplace',
        selectedTradeId: null,
        notificationCount: 0,
    });

    // Load state from sessionStorage on mount
    useEffect(() => {
        const savedState = sessionStorage.getItem('hubState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setState(parsed);
            } catch (error) {
                console.error('Failed to parse saved hub state:', error);
            }
        }
    }, []);

    // Save state to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('hubState', JSON.stringify(state));
    }, [state]);

    const setActiveView = useCallback((view: HubView) => {
        setState(prev => ({
            ...prev,
            activeView: view,
            // Clear selected trade when leaving trade room
            selectedTradeId: view === 'trade-room' ? prev.selectedTradeId : null,
        }));
    }, []);

    const openTradeRoom = useCallback((tradeId: string) => {
        setState(prev => ({
            ...prev,
            activeView: 'trade-room',
            selectedTradeId: tradeId,
        }));
    }, []);

    const closeTradeRoom = useCallback(() => {
        setState(prev => ({
            ...prev,
            activeView: 'my-trades',
            selectedTradeId: null,
        }));
    }, []);

    const setNotificationCount = useCallback((count: number) => {
        setState(prev => ({
            ...prev,
            notificationCount: count,
        }));
    }, []);

    const incrementNotifications = useCallback(() => {
        setState(prev => ({
            ...prev,
            notificationCount: prev.notificationCount + 1,
        }));
    }, []);

    const clearNotifications = useCallback(() => {
        setState(prev => ({
            ...prev,
            notificationCount: 0,
        }));
    }, []);

    return {
        activeView: state.activeView,
        selectedTradeId: state.selectedTradeId,
        notificationCount: state.notificationCount,
        setActiveView,
        openTradeRoom,
        closeTradeRoom,
        setNotificationCount,
        incrementNotifications,
        clearNotifications,
    };
};
