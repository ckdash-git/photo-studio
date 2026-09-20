-- Tracks paid lead access for photographers. Deliberately separate from
-- the `payments` table (which is booking-specific) rather than forcing a
-- shared shape prematurely - these will likely converge once Razorpay
-- replaces the mock provider for both flows, but there's no need to
-- couple them before that's a real requirement.
create table if not exists photographer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references photographers(id) on delete cascade,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'expired')),
  starts_at timestamptz,
  expires_at timestamptz,
  amount_inr int not null,
  provider text not null default 'mock',
  provider_order_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_photographer on photographer_subscriptions (photographer_id);

alter table photographer_subscriptions enable row level security;

create policy "photographers see own subscriptions" on photographer_subscriptions
  for select using (
    exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  );

grant select on photographer_subscriptions to authenticated;
-- Inserts/updates go through the service-role key only (see /api/subscriptions),
-- same reasoning as bookings: a customer-writable "I paid" flag would be
-- trivially forgeable if the client could set it directly.
