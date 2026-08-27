begin;

alter table public.transaction_pickup_codes
  add column if not exists failed_attempts integer not null default 0 check (failed_attempts >= 0),
  add column if not exists last_attempt_at timestamptz;

comment on column public.transaction_pickup_codes.failed_attempts is
  'Failed seller-entered pickup-code attempts. The server temporarily blocks further attempts after five failures.';

commit;
