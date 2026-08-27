begin;

create table public.transactional_email_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null check (char_length(event_type) between 1 and 80),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text,
  subject text not null,
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactional_email_events_pending_idx
  on public.transactional_email_events (status, created_at)
  where status = 'pending';

alter table public.transactional_email_events enable row level security;
revoke all on table public.transactional_email_events from anon, authenticated;

comment on table public.transactional_email_events is
  'Idempotency ledger for transactional email. Service role only; event_key may be sent at most once.';

commit;
