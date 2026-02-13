'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TradeRoomView } from '@/components/hub/views/TradeRoomView';

export default function TradeRoomPage() {
    const params = useParams();
    const router = useRouter();
    const tradeId = params.id as string;

    const handleBack = () => {
        router.push('/dashboard/trade-room');
        // Or just router.back() or router.push('/dashboard') depending on desired flow.
        // Since this is a standalone page, routing to dashboard seems appropriate.
        router.push('/dashboard');
    };

    return (
        <TradeRoomView
            tradeId={tradeId}
            onBack={handleBack}
        />
    );
}
