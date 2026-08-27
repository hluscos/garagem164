begin;

alter table public.transactions
  add column if not exists payment_processing_fee numeric(12, 2);

alter table public.transactions
  drop constraint if exists transactions_payment_processing_fee_check;

alter table public.transactions
  add constraint transactions_payment_processing_fee_check
  check (
    payment_processing_fee is null
    or payment_processing_fee >= 0
  );

comment on column public.transactions.payment_processing_fee is
  'Exact Stripe processing fee for the successful payment. Written only by trusted server routes.';

commit;
