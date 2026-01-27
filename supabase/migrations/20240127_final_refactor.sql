
-- Final Migration for Currency and Table Refactoring

-- 1. Table Renaming (Unification)
-- If listings exists but offers doesn't, we want to unify them.
-- If both exist, we might need a more complex merge, but we'll assume listings is the "new" one.
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') AND 
       NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'offers') THEN
        ALTER TABLE public.listings RENAME TO offers;
    END IF;
END $$;

-- 2. Modify offers table (ensure platform and currency_code exist)
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS currency_code TEXT;

-- Handle old columns if they exist
DO $$
BEGIN
    -- Rename asset_type to platform if it exists and platform is empty
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='asset_type') THEN
        UPDATE public.offers SET platform = asset_type WHERE platform IS NULL;
        ALTER TABLE public.offers DROP COLUMN asset_type;
    END IF;
    
    -- Rename currency to currency_code if it exists and currency_code is empty
    -- (Previous migration might have already dropped it, but let's be safe)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='currency') THEN
        UPDATE public.offers SET currency_code = currency WHERE currency_code IS NULL;
        ALTER TABLE public.offers DROP COLUMN currency;
    END IF;
END $$;

-- 3. Modify trades table
-- Rename amount_units to amount_dzd if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='amount_units') THEN
        ALTER TABLE public.trades RENAME COLUMN amount_units TO amount_dzd;
    END IF;
    
    -- Ensure amount_asset exists (corresponds to the units being traded)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='amount_asset') THEN
        -- If old 'amount' column exists, rename it. Otherwise create it.
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trades' AND column_name='amount') THEN
            ALTER TABLE public.trades RENAME COLUMN amount TO amount_asset;
        ELSE
            ALTER TABLE public.trades ADD COLUMN amount_asset NUMERIC;
        END IF;
    END IF;
END $$;
