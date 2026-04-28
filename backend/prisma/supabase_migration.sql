-- MIGRATION: Institutional Billing & Expense Management
-- Target: Supabase / PostgreSQL

-- 1. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL,
    user_id TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'PENDING', -- e.g., PENDING, APPROVED, REJECTED
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL, -- e.g., PROFESSIONAL, ENTERPRISE
    status TEXT NOT NULL, -- e.g., ACTIVE, EXPIRED, CANCELLED
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    billing_cycle TEXT NOT NULL, -- e.g., MONTHLY, YEARLY
    start_date TIMESTAMPTZ DEFAULT now(),
    end_date TIMESTAMPTZ NOT NULL,
    paystack_ref TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Subscription Transactions Table
CREATE TABLE IF NOT EXISTS public.subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id),
    plan TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    billing_cycle TEXT NOT NULL,
    paystack_ref TEXT UNIQUE,
    status TEXT NOT NULL, -- e.g., SUCCESS, FAILED
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ensure OCC Versioning on Core Entities
DO $$
BEGIN
    -- Add version to organizations (businesses)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='version') THEN
        ALTER TABLE public.organizations ADD COLUMN version INTEGER DEFAULT 1;
    END IF;

    -- Add version to clients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='version') THEN
        ALTER TABLE public.clients ADD COLUMN version INTEGER DEFAULT 1;
    END IF;

    -- Add version to invoices
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='version') THEN
        ALTER TABLE public.invoices ADD COLUMN version INTEGER DEFAULT 1;
    END IF;

    -- Add version to quotations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='version') THEN
        ALTER TABLE public.quotations ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_expenses_org ON public.expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sub_trans_sub ON public.subscription_transactions(subscription_id);

-- Enable RLS (Optional but recommended)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;
