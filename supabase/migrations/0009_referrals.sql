-- Replaces the original email-based referrals table concept (never built
-- on top of) with a proper user-account-based referral loop.

-- One unique referral code per user, created lazily on first visit to
-- their invite page.
create table if not exists user_referral_codes (
  user_id uuid primary key references auth.users(id),
  code text not null unique,
  created_at timestamptz not null default now()
);

-- Admin-configurable reward amounts - single settings row, edited via
-- /admin/referrals rather than hardcoded.
create table if not exists referral_settings (
  id text primary key default 'default',
  welcome_percent_off int not null default 10,
  referrer_percent_off int not null default 10,
  updated_at timestamptz not null default now()
);
insert into referral_settings (id) values ('default') on conflict do nothing;

-- One row per successful referral signup. reward_issued_at stays null
-- until the referred user's first booking actually completes - the
-- referrer's reward is contingent on a real, paying customer, not just
-- a signup.
create table if not exists referral_signups (
  id uuid primary key default gen_random_uuid(),
  referred_user_id uuid not null unique references auth.users(id),
  referrer_user_id uuid not null references auth.users(id),
  code_used text not null,
  welcome_coupon_code text not null,
  reward_coupon_code text,
  reward_issued_at timestamptz,
  created_at timestamptz not null default now()
);

-- A coupon restricted to one specific user - prevents a welcome/reward
-- coupon meant for one person being seen and reused by someone else,
-- since coupon codes are otherwise globally redeemable by anyone who
-- knows them.
alter table coupons add column if not exists restricted_to_user_id uuid references auth.users(id);

create index if not exists idx_referral_signups_referrer on referral_signups (referrer_user_id);

alter table user_referral_codes enable row level security;
alter table referral_settings enable row level security;
alter table referral_signups enable row level security;

create policy "users read own referral code" on user_referral_codes
  for select using (auth.uid() = user_id);
create policy "users insert own referral code" on user_referral_codes
  for insert with check (auth.uid() = user_id);

create policy "referral settings are publicly readable" on referral_settings
  for select using (true);

create policy "users see referrals they made" on referral_signups
  for select using (auth.uid() = referrer_user_id);

grant select, insert on user_referral_codes to authenticated;
grant select on referral_settings to anon, authenticated;
grant select on referral_signups to authenticated;
