begin;

create extension if not exists pgcrypto;

create table public.raffle_draws (
  raffle_id uuid primary key references public.listings(id) on delete restrict,
  winner_user_id uuid not null references auth.users(id) on delete restrict,
  winning_ticket_number integer not null check (winning_ticket_number > 0),
  paid_ticket_count integer not null check (paid_ticket_count > 0),
  selection_index integer not null check (selection_index >= 0),
  random_source_hex text not null check (random_source_hex ~ '^[0-9a-f]{8}$'),
  selection_method text not null default 'pgcrypto_rejection_sampling_paid_ticket_v1',
  drawn_at timestamptz not null default now()
);

alter table public.raffle_draws enable row level security;
revoke all on table public.raffle_draws from anon, authenticated;

create function public.draw_raffle_winner(p_raffle_id uuid)
returns table (
  raffle_id uuid,
  winner_user_id uuid,
  winning_ticket_number integer,
  paid_ticket_count integer,
  random_source_hex text,
  drawn_at timestamptz,
  created_new boolean
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  raffle_total integer;
  paid_count integer;
  unique_paid_count integer;
  selected_ticket integer;
  selected_user uuid;
  random_bytes bytea;
  random_value bigint;
  acceptance_limit numeric;
  selected_index integer;
  existing_draw public.raffle_draws%rowtype;
  created_draw public.raffle_draws%rowtype;
begin
  -- A lock on the listing serialises concurrent cron invocations for one raffle.
  select total_tickets
    into raffle_total
    from public.listings
   where id = p_raffle_id
     and listing_type = 'raffle'
   for update;

  if not found or raffle_total is null or raffle_total <= 0 then
    raise exception 'Raffle % is invalid or not found', p_raffle_id;
  end if;

  select *
    into existing_draw
    from public.raffle_draws
   where raffle_draws.raffle_id = p_raffle_id;

  if found then
    return query
      select existing_draw.raffle_id, existing_draw.winner_user_id,
             existing_draw.winning_ticket_number, existing_draw.paid_ticket_count,
             existing_draw.random_source_hex, existing_draw.drawn_at, false;
    return;
  end if;

  -- Only tickets linked to a recorded, paid Stripe Checkout session participate.
  select count(*)::integer, count(distinct tickets.ticket_number)::integer
    into paid_count, unique_paid_count
    from public.raffle_tickets tickets
    join public.stripe_payments payments
      on payments.stripe_session_id = tickets.stripe_session_id
     and payments.raffle_id = tickets.raffle_id
   where tickets.raffle_id = p_raffle_id;

  if paid_count <> raffle_total or unique_paid_count <> paid_count then
    raise exception 'Raffle % cannot be drawn: % unique paid tickets, % rows, % required',
      p_raffle_id, unique_paid_count, paid_count, raffle_total;
  end if;

  -- Rejection sampling avoids modulo bias while selecting an index in the paid-ticket set.
  acceptance_limit := floor(4294967296::numeric / paid_count) * paid_count;
  loop
    random_bytes := gen_random_bytes(4);
    random_value :=
      (get_byte(random_bytes, 0)::bigint << 24)
      + (get_byte(random_bytes, 1)::bigint << 16)
      + (get_byte(random_bytes, 2)::bigint << 8)
      + get_byte(random_bytes, 3)::bigint;
    exit when random_value < acceptance_limit;
  end loop;

  selected_index := (random_value % paid_count)::integer;

  select tickets.ticket_number, tickets.user_id
    into selected_ticket, selected_user
    from public.raffle_tickets tickets
    join public.stripe_payments payments
      on payments.stripe_session_id = tickets.stripe_session_id
     and payments.raffle_id = tickets.raffle_id
   where tickets.raffle_id = p_raffle_id
   order by tickets.ticket_number
   offset selected_index
   limit 1;

  if selected_ticket is null or selected_user is null then
    raise exception 'Raffle % selected no paid ticket', p_raffle_id;
  end if;

  insert into public.raffle_draws (
    raffle_id,
    winner_user_id,
    winning_ticket_number,
    paid_ticket_count,
    selection_index,
    random_source_hex
  ) values (
    p_raffle_id,
    selected_user,
    selected_ticket,
    paid_count,
    selected_index,
    encode(random_bytes, 'hex')
  )
  returning * into created_draw;

  update public.listings
     set sale_status = 'sold'
   where id = p_raffle_id
     and listing_type = 'raffle';

  return query
    select created_draw.raffle_id, created_draw.winner_user_id,
           created_draw.winning_ticket_number, created_draw.paid_ticket_count,
           created_draw.random_source_hex, created_draw.drawn_at, true;
end;
$$;

revoke all on function public.draw_raffle_winner(uuid) from public, anon, authenticated;
grant execute on function public.draw_raffle_winner(uuid) to service_role;

comment on table public.raffle_draws is
  'One immutable audit record per completed raffle, selected exclusively from Stripe-paid tickets.';
comment on function public.draw_raffle_winner(uuid) is
  'Service-role-only, idempotent raffle draw using pgcrypto entropy and rejection sampling.';

commit;
