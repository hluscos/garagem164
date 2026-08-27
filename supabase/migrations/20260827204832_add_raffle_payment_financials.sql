begin;

create table public.raffle_payment_financials (
  stripe_session_id text primary key,
  raffle_id uuid not null references public.listings(id) on delete restrict,
  seller_id uuid not null references auth.users(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  stripe_payment_intent text,
  stripe_balance_transaction text,
  gross_amount numeric(12, 2) not null check (gross_amount > 0),
  platform_fee numeric(12, 2) not null check (platform_fee >= 0),
  stripe_fee numeric(12, 2),
  seller_net_amount numeric(12, 2),
  currency text not null default 'eur' check (currency = lower(currency)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffle_payment_financials_settlement_check check (
    (stripe_fee is null and seller_net_amount is null)
    or (stripe_fee is not null and seller_net_amount is not null)
  )
);

create index raffle_payment_financials_raffle_idx
  on public.raffle_payment_financials (raffle_id, created_at);

alter table public.raffle_payment_financials enable row level security;
revoke all on table public.raffle_payment_financials from anon, authenticated;

comment on table public.raffle_payment_financials is
  'Per-paid-checkout raffle accounting. The platform fee is exactly 3% of gross paid tickets; Stripe fees are captured from Stripe balance transactions.';

commit;
