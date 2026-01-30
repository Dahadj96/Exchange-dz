# Supabase Schema Reference (Master)

## Table: offers
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- platform (text) -- e.g., 'Wise', 'RedotPay', 'Paysera'
- currency_code (text) -- e.g., 'EUR', 'USD'
- rate (numeric) -- DZD per 1 unit
- min_amount (numeric)
- max_amount (numeric)
- available_amount (numeric)
- created_at (timestamptz)

## Table: trades
- id (uuid, primary key)
- offer_id (uuid, references offers)
- buyer_id (uuid, references auth.users)
- seller_id (uuid, references auth.users)
- amount_asset (numeric)
- amount_dzd (numeric)
- status (text) -- 'pending', 'completed', 'cancelled'
- created_at (timestamptz)

## Table: messages
- id (uuid, primary key)
- trade_id (uuid, references trades)
- sender_id (uuid, references auth.users)
- content (text)
- created_at (timestamptz)

## Table: disputes
- id (uuid, primary key)
- trade_id (uuid, references trades)
- raised_by (uuid, references auth.users)
- reason (text)
- status (text) -- 'open', 'resolved'

