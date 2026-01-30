# Database Schema Reference (Source of Truth)

## Table: OFFERS
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles.id)
- `platform` (TEXT) - e.g., 'Wise', 'Paysera', 'RedotPay', 'USDT'
- `currency_code` (TEXT) - e.g., 'EUR', 'USD', 'DZD'
- `rate` (NUMERIC)
- `min_amount` (NUMERIC)
- `max_amount` (NUMERIC)
- `available_amount` (NUMERIC)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

## Table: TRADES
- `id` (UUID, PK)
- `offer_id` (UUID, FK -> offers.id)
- `buyer_id` (UUID, FK -> profiles.id)
- `seller_id` (UUID, FK -> profiles.id)
- `amount_asset` (NUMERIC)
- `amount_dzd` (NUMERIC)
- `status` (TEXT) - 'Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease', 'Completed', 'Disputed', 'Cancelled'
- `receipt_url` (TEXT, optional)
- `payment_details` (JSONB, optional)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Table: MESSAGES
- `id` (UUID, PK)
- `trade_id` (UUID, FK -> trades.id)
- `sender_id` (UUID, FK -> profiles.id)
- `content` (TEXT)
- `attachment_url` (TEXT, optional)
- `created_at` (TIMESTAMPTZ)

## Table: DISPUTES
- `id` (UUID, PK)
- `trade_id` (UUID, FK -> trades.id)
- `raised_by` (UUID, FK -> profiles.id)
- `reason` (TEXT)
- `status` (TEXT) - 'Open', 'Resolved', 'Closed'
- `created_at` (TIMESTAMPTZ)

---
**Permanent Rules:**
1. ALWAYS refer to this file before writing queries.
2. NEVER use `listing_id` or `stock`.
3. ALWAYS use `offer_id` and `available_amount`.
4. ALWAYS wrap numeric inputs in safe `Number()` parsing.
