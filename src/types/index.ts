export type PlatformType = 'Wise' | 'Paysera' | 'RedotPay' | 'USDT' | 'Payoneer' | 'Skrill';
export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'DZD';

export type TradeStatus =
    | 'Pending'
    | 'AwaitingPayment'
    | 'Paid'
    | 'AwaitingRelease'
    | 'Completed'
    | 'Cancelled'
    | 'Disputed';

export interface Profile {
    id: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    is_verified: boolean;
    success_rate: number;
    total_trades: number;
    created_at: string;
}

export interface Listing {
    id: string;
    user_id: string;
    platform: PlatformType;
    currency_code: SupportedCurrency;
    rate: number;
    stock: number;
    min_amount: number;
    max_amount: number;
    is_active: boolean;
    created_at: string;
}

export interface Trade {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    amount_asset: number;
    amount_dzd: number;
    status: TradeStatus;
    receipt_url?: string;
    payment_details?: {
        method: string;
        details: string;
        note?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    trade_id: string;
    sender_id: string;
    content: string;
    attachment_url?: string;
    created_at: string;
}
