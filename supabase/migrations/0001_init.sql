-- Initial schema: services, slots, bookings, payments, coupons, referrals
-- Run via `supabase db push` or the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- One row per bookable photo shoot package (e.g. "Portrait session - 1hr")
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null,
  price_inr int not null, -- store in paise-free rupees; keep integer to avoid float issues
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bookable time slots per service. Generate these ahead of time (cron/admin tool)
-- rather than computing availability on the fly, so double-booking is a simple
-- unique constraint instead of application logic.
create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (service_id, starts_at)
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off int check (percent_off between 1 and 100),
  amount_off_inr int check (amount_off_inr >= 0),
  max_redemptions int, -- null = unlimited
  redemptions_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint one_discount_type check (
    (percent_off is not null and amount_off_inr is null) or
    (percent_off is null and amount_off_inr is not null)
  )
);

-- One row per customer referral code. A customer refers others using their code.
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_email text not null,
  code text not null unique,
  reward_amount_inr int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  coupon_id uuid references coupons(id),
  referral_code text references referrals(code),
  subtotal_inr int not null,
  discount_inr int not null default 0,
  total_inr int not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'cancelled', 'refunded')),
  created_at timestamptz not null default now()
);

-- One row per payment attempt against a booking. A booking can have multiple
-- rows here if a payment fails and the customer retries.
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  provider text not null default 'cashfree',
  provider_order_id text not null,
  provider_payment_id text,
  amount_inr int not null,
  method text, -- upi, card, netbanking, etc (from provider webhook)
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_slots_service_available
  on slots (service_id, starts_at) where is_booked = false;

create index if not exists idx_bookings_status on bookings (status);
create index if not exists idx_payments_booking on payments (booking_id);

-- Row Level Security: customers should never read/write these tables directly
-- from the browser. All booking/payment writes go through server routes using
-- the service-role key. Enable RLS with no policies = deny-all for the anon key.
alter table services enable row level security;
alter table slots enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table referrals enable row level security;

-- Public read access for browsing available services/slots (booking widget needs this).
create policy "services are publicly readable" on services
  for select using (is_active = true);

create policy "open slots are publicly readable" on slots
  for select using (is_booked = false);
