begin;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_distinct_participants check (buyer_id <> seller_id),
  constraint conversations_one_thread_per_listing unique (listing_id, buyer_id, seller_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index conversations_buyer_updated_idx on public.conversations (buyer_id, updated_at desc);
create index conversations_seller_updated_idx on public.conversations (seller_id, updated_at desc);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index messages_unread_idx on public.messages (conversation_id, sender_id) where read_at is null;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on table public.conversations from anon, authenticated;
revoke all on table public.messages from anon, authenticated;
grant select on table public.conversations to authenticated;
grant select on table public.messages to authenticated;

create policy "Participants can read their conversations"
  on public.conversations
  for select
  to authenticated
  using (
    buyer_id = (select auth.uid())
    or seller_id = (select auth.uid())
  );

create policy "Participants can read conversation messages"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.buyer_id = (select auth.uid())
          or conversations.seller_id = (select auth.uid())
        )
    )
  );

-- The application writes through authenticated server routes. Keeping this policy
-- gives a second line of defence if direct authenticated writes are enabled later.
create policy "Participants can only send as themselves"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.buyer_id = (select auth.uid())
          or conversations.seller_id = (select auth.uid())
        )
    )
  );

create function public.touch_conversation_after_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

revoke execute on function public.touch_conversation_after_message() from public, anon, authenticated;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_after_message();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

comment on table public.conversations is
  'Private buyer-seller chat threads, scoped to a single listing.';
comment on table public.messages is
  'Private messages; RLS grants reads only to the two conversation participants.';

commit;
