-- Phase 18: Session intents (pre-ledger workflow) + public charger/host preview RPC.
-- Drivers cannot SELECT other users' profiles under strict RLS; preview uses SECURITY DEFINER RPC.

begin;

-- ---------------------------------------------------------------------------
-- Charger + host preview (marketplace-safe fields only).
-- ---------------------------------------------------------------------------
create or replace function public.get_charger_session_preview(p_charger_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'charger_id', c.id,
    'charger_title', c.title,
    'charger_label', c.label,
    'plug_type', c.plug_type,
    'price_per_kwh', c.price_per_kwh,
    'description', c.description,
    'parking_instructions', c.parking_instructions,
    'charger_status', c.status,
    'host_display_name', u.display_name,
    'host_contact_method', u.contact_method,
    'host_wallet', u.wallet_address
  )
  from public.chargers c
  left join public.users u on u.id = c.owner_id
  where c.id = p_charger_id;
$$;

grant execute on function public.get_charger_session_preview(uuid) to anon, authenticated;

comment on function public.get_charger_session_preview(uuid) is
  'Returns listing + host contact snippets for session start UI (grant / map preview). Does not expose auth secrets.';

-- ---------------------------------------------------------------------------
-- Session intents: opened → qr_verified → awaiting_escrow → charging → …
-- Ledger table charging_sessions stays immutable completed receipts.
-- ---------------------------------------------------------------------------
create table if not exists public.charging_session_intents (
  id uuid primary key default gen_random_uuid(),
  charger_id uuid not null references public.chargers (id) on delete cascade,
  driver_wallet text not null,
  host_wallet text not null,
  stage text not null default 'opened'
    check (
      stage in (
        'opened',
        'qr_verified',
        'awaiting_escrow',
        'charging',
        'completed',
        'cancelled'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists charging_session_intents_charger_idx
  on public.charging_session_intents (charger_id);

create index if not exists charging_session_intents_driver_wallet_idx
  on public.charging_session_intents (driver_wallet);

create index if not exists charging_session_intents_host_wallet_idx
  on public.charging_session_intents (host_wallet);

alter table public.charging_session_intents enable row level security;

drop policy if exists "charging_session_intents_select_parties" on public.charging_session_intents;
drop policy if exists "charging_session_intents_insert_driver" on public.charging_session_intents;
drop policy if exists "charging_session_intents_update_parties" on public.charging_session_intents;

-- Driver or host (wallet-linked profile) can read rows they participate in.
create policy "charging_session_intents_select_parties"
  on public.charging_session_intents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.wallet_address is not null
        and (
          u.wallet_address = charging_session_intents.driver_wallet
          or u.wallet_address = charging_session_intents.host_wallet
        )
    )
  );

-- Only the driver wallet (linked to auth) can create an intent for that driver_wallet.
create policy "charging_session_intents_insert_driver"
  on public.charging_session_intents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.wallet_address is not null
        and u.wallet_address = charging_session_intents.driver_wallet
    )
  );

-- Driver or host can update workflow stage (immutable ledger stays separate).
create policy "charging_session_intents_update_parties"
  on public.charging_session_intents
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.wallet_address is not null
        and (
          u.wallet_address = charging_session_intents.driver_wallet
          or u.wallet_address = charging_session_intents.host_wallet
        )
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.wallet_address is not null
        and (
          u.wallet_address = charging_session_intents.driver_wallet
          or u.wallet_address = charging_session_intents.host_wallet
        )
    )
  );

commit;
