alter table public.listings
  add column delivery_method text not null default 'shipping',
  add column pickup_location text;

alter table public.listings
  add constraint listings_delivery_method_check
  check (delivery_method in ('shipping', 'pickup')),
  add constraint listings_pickup_location_check
  check (
    delivery_method <> 'pickup'
    or nullif(btrim(pickup_location), '') is not null
  );

alter table public.transactions
  add column delivery_method text not null default 'shipping',
  add column pickup_location text;

alter table public.transactions
  add constraint transactions_delivery_method_check
  check (delivery_method in ('shipping', 'pickup'));

comment on column public.listings.delivery_method is
  'Delivery method selected by the seller: shipping or pickup.';
comment on column public.listings.pickup_location is
  'Public locality for in-person pickup. Do not store a full private address.';

revoke execute on function public.complete_transaction_payout(uuid, text)
  from public, anon, authenticated;
revoke execute on function public.mark_transaction_awaiting_shipment(uuid)
  from public, anon, authenticated;
revoke execute on function public.mark_transaction_delivered(uuid)
  from public, anon, authenticated;
revoke execute on function public.mark_transaction_ready_for_payout(uuid)
  from public, anon, authenticated;
revoke execute on function public.mark_transaction_shipped(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.complete_transaction_payout(uuid, text)
  to service_role;
grant execute on function public.mark_transaction_awaiting_shipment(uuid)
  to service_role;
grant execute on function public.mark_transaction_delivered(uuid)
  to service_role;
grant execute on function public.mark_transaction_ready_for_payout(uuid)
  to service_role;
grant execute on function public.mark_transaction_shipped(uuid, text, text)
  to service_role;
