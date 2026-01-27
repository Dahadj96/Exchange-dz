'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubView } from '@/hooks/useHubState';
import { MarketplaceView } from './views/MarketplaceView';
import { MyTradesView } from './views/MyTradesView';
import { MyOffersView } from './views/MyOffersView';
import { SettingsView } from './views/SettingsView';
import { TradeRoomView } from './views/TradeRoomView';

interface HubMiddleColumnProps {
    activeView: HubView;
    selectedTradeId: string | null;
    onTradeClick: (tradeId: string) => void;
    onBackFromTrade: () => void;
    userId: string;
}

export const HubMiddleColumn = ({
    activeView,
    selectedTradeId,
    onTradeClick,
    onBackFromTrade,
    userId,
}: HubMiddleColumnProps) => {
    const slideVariants = {
        enter: {
            x: 50,
            opacity: 0,
        },
        center: {
            x: 0,
            opacity: 1,
        },
        exit: {
            x: -50,
            opacity: 0,
        },
    };

    return (
        <div className="h-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="h-full overflow-y-auto px-2"
                >
                    {activeView === 'marketplace' && <MarketplaceView />}
                    {activeView === 'my-trades' && <MyTradesView onTradeClick={onTradeClick} />}
                    {activeView === 'my-offers' && <MyOffersView />}
                    {activeView === 'settings' && <SettingsView userId={userId} />}
                    {activeView === 'trade-room' && selectedTradeId && (
                        <TradeRoomView tradeId={selectedTradeId} onBack={onBackFromTrade} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
