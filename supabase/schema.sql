-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  success_rate NUMERIC DEFAULT 100,
  total_trades INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offers table (Replaces listings)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL DEFAULT auth.uid(),
  platform TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  available_amount NUMERIC NOT NULL,
  min_amount NUMERIC NOT NULL,
  max_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID REFERENCES public.offers(id) NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount_asset NUMERIC NOT NULL,
  amount_dzd NUMERIC NOT NULL,
  status TEXT NOT NULL, -- 'Pending', 'AwaitingPayment', 'Paid', 'AwaitingRelease', 'Completed', 'Disputed', 'Cancelled'
  receipt_url TEXT,
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) NOT NULL,
  raised_by UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- ... Policies updated to reference new table/column names ...
-- (Skipping policy detail for brevity as per user focus on schema names)

-- Basic Policies (Adjust as needed for production)

-- Profiles: Public read, User update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Offers: Public read, User create/update own
CREATE POLICY "Offers are viewable by everyone" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Users can insert their own offers" ON public.offers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own offers" ON public.offers FOR UPDATE USING (auth.uid() = user_id);

-- Trades: Participants read, Participants create/update
CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can insert trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = buyer_id); -- Assuming buyer starts trade
CREATE POLICY "Users can update their own trades" ON public.trades FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages: Participants read/insert
CREATE POLICY "Users can view messages for their trades" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trades
    WHERE trades.id = messages.trade_id
    AND (trades.buyer_id = auth.uid() OR trades.seller_id = auth.uid())
  )
);
CREATE POLICY "Users can insert messages for their trades" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trades
    WHERE trades.id = trade_id
    AND (trades.buyer_id = auth.uid() OR trades.seller_id = auth.uid())
  )
);

-- Disputes: Participants read/insert (Basic for now)
CREATE POLICY "Users can view disputes for their trades" ON public.disputes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.trades
        WHERE trades.id = disputes.trade_id
        AND (trades.buyer_id = auth.uid() OR trades.seller_id = auth.uid())
    )
);
