begin;

alter table public.transactions
  add column if not exists auto_confirm_at timestamptz,
  add column if not exists delivery_confirmed_at timestamptz,
  add column if not exists delivery_confirmation_method text;

alter table public.transactions
  drop constraint if exists transactions_delivery_confirmation_method_check;

alter table public.transactions
  add constraint transactions_delivery_confirmation_method_check
  check (
    delivery_confirmation_method is null
    or delivery_confirmation_method in (
      'buyer_receipt',
      'pickup_code',
      'automatic_timeout'
    )
  );

create table if not exists public.transaction_pickup_codes (
  transaction_id uuid primary key references public.transactions(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  confirmation_code text not null check (confirmation_code ~ '^[0-9]{6}$'),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.transaction_pickup_codes enable row level security;

revoke all on table public.transaction_pickup_codes
  from public, anon, authenticated;

grant select on table public.transaction_pickup_codes to authenticated;

drop policy if exists "buyers can read their pickup code"
  on public.transaction_pickup_codes;

create policy "buyers can read their pickup code"
  on public.transaction_pickup_codes
  for select
  to authenticated
  using ((select auth.uid()) = buyer_id);

create or replace function public.confirm_transaction_delivery(
  p_transaction_id uuid,
  p_confirmation_method text
)
returns table (
  id uuid,
  commercial_status text,
  financial_status text,
  protection_ends_at timestamptz,
  delivery_confirmed_at timestamptz,
  delivery_confirmation_method text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  transaction_row public.transactions%rowtype;
begin
  select *
    into transaction_row
    from public.transactions
    where id = p_transaction_id
    for update;

  if not found then
    raise exception 'Transaction not found.';
  end if;

  if transaction_row.financial_status <> 'held' then
    raise exception 'Transaction is not held.';
  end if;

  if p_confirmation_method = 'buyer_receipt' then
    if transaction_row.delivery_method <> 'shipping'
       or transaction_row.commercial_status <> 'shipped' then
      raise exception 'Shipping receipt cannot be confirmed in this state.';
    end if;
  elsif p_confirmation_method = 'pickup_code' then
    if transaction_row.delivery_method <> 'pickup'
       or transaction_row.commercial_status not in ('paid', 'awaiting_shipment') then
      raise exception 'Pickup cannot be confirmed in this state.';
    end if;
  elsif p_confirmation_method = 'automatic_timeout' then
    if transaction_row.delivery_method <> 'shipping'
       or transaction_row.commercial_status <> 'shipped'
       or transaction_row.auto_confirm_at is null
       or transaction_row.auto_confirm_at > now() then
      raise exception 'Transaction is not eligible for automatic completion.';
    end if;
  else
    raise exception 'Unknown delivery confirmation method.';
  end if;

  return query
  update public.transactions
    set commercial_status = 'delivered',
        financial_status = 'ready_for_payout',
        protection_ends_at = now(),
        delivery_confirmed_at = now(),
        delivery_confirmation_method = p_confirmation_method,
        auto_confirm_at = null
    where public.transactions.id = p_transaction_id
    returning
      public.transactions.id,
      public.transactions.commercial_status,
      public.transactions.financial_status,
      public.transactions.protection_ends_at,
      public.transactions.delivery_confirmed_at,
      public.transactions.delivery_confirmation_method;
end;
$$;

revoke execute on function public.confirm_transaction_delivery(uuid, text)
  from public, anon, authenticated;

grant execute on function public.confirm_transaction_delivery(uuid, text)
  to service_role;

commit;
