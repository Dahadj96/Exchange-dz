# Supabase Schema Reference (Master)

## Table: offers
- id (uuid, primary key)
- user_id (uuid, references profiles.id) -- linked to auth.users
- platform (text) -- e.g., 'Wise', 'RedotPay', 'Paysera'
- currency_code (text) -- e.g., 'EUR', 'USD'
- rate (numeric) -- DZD per 1 unit
- min_amount (numeric)
- max_amount (numeric)
- available_amount (numeric)
- is_active (boolean) -- default true
- created_at (timestamptz)

## Table: trades
- id (uuid, primary key)
- offer_id (uuid, references offers.id)
- buyer_id (uuid, references profiles.id)
- seller_id (uuid, references profiles.id)
- amount_asset (numeric)
- amount_dzd (numeric)
- status (text) -- 'pending', 'completed', 'cancelled', 'paid', 'disputed'
- receipt_url (text, optional)
- payment_details (jsonb, optional)
- created_at (timestamptz)
- updated_at (timestamptz)

## Table: messages
- id (uuid, primary key)
- trade_id (uuid, references trades.id)
- sender_id (uuid, references profiles.id)
- content (text)
- created_at (timestamptz)

## Table: disputes
- id (uuid, primary key)
- trade_id (uuid, references trades.id)
- raised_by (uuid, references profiles.id)
- reason (text)
- status (text) -- 'open', 'resolved'
- created_at (timestamptz)
- updated_at (timestamptz)

---

## 🔒 Permanent Rules
1. **Zero Tolerance**: NEVER use `listing_id` or `stock`.
2. **Schema Alignment**: ALWAYS use `offer_id` and `available_amount`.
3. **Safety**: ALWAYS wrap numeric inputs in `Number(value) || 0` before Supabase calls to prevent null constraint violations.
4. **Verification**: Refer to this file as the MASTER source of truth for all DB logic.