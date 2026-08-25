create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active',
  source text not null default 'footer',
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_normalized_check check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 254
  ),
  constraint newsletter_subscribers_status_check check (
    status in ('active', 'unsubscribed')
  ),
  constraint newsletter_subscribers_status_dates_check check (
    (status = 'active' and unsubscribed_at is null)
    or (status = 'unsubscribed' and unsubscribed_at is not null)
  )
);

comment on table public.newsletter_subscribers is
  'Subscrições voluntárias da newsletter e respetivo estado de consentimento.';
comment on column public.newsletter_subscribers.unsubscribe_token is
  'Token individual usado para cancelar a subscrição sem expor o email.';

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from public, anon, authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;
