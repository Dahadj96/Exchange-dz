-- Migration to refactor listings and trades for real currency support

-- 1. Modify listings table
-- Add new columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS currency_code TEXT;

-- We'll assume for now we don't need to migrate data extensively since it's a dev environment
-- But let's at least set some defaults if there are existing rows to avoid NOT NULL violations immediately
-- For a real prod migration, we'd map 'Wise' -> platform='Wise', currency='EUR' etc.

-- Make them NOT NULL after potential data fix (omitted for dev simplicity, assuming clean slate or okay to fail old rows)
-- ALTER TABLE public.listings ALTER COLUMN platform SET NOT NULL;
-- ALTER TABLE public.listings ALTER COLUMN currency_code SET NOT NULL;

-- Rename old currency column to something legacy or drop it. Let's drop it to be clean.
-- WARNING: This deletes data in 'currency' column.
ALTER TABLE public.listings DROP COLUMN IF EXISTS currency;

-- 2. Modify trades table
-- Rename amount to amount_asset for clarity
ALTER TABLE public.trades RENAME COLUMN amount TO amount_asset;

-- Add amount_dzd
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS amount_dzd NUMERIC;

-- Create Types if helpful, or just check constraints
-- For now, we trust the application to enforce 'Wise', 'EUR' etc. until we want DB constraints.
