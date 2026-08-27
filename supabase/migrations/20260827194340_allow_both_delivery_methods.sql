begin;

alter table public.listings
  drop constraint if exists listings_delivery_method_check;

alter table public.listings
  add constraint listings_delivery_method_check
  check (delivery_method in ('shipping', 'pickup', 'both'));

alter table public.listings
  drop constraint if exists listings_pickup_location_check;

alter table public.listings
  add constraint listings_pickup_location_check
  check (
    delivery_method not in ('pickup', 'both')
    or nullif(btrim(pickup_location), '') is not null
  );

comment on column public.listings.delivery_method is
  'Delivery options offered by the seller: shipping, pickup, or both.';

comment on column public.transactions.delivery_method is
  'Delivery option selected for this transaction: shipping or pickup.';

commit;
