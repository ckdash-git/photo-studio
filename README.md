# Photo Studio Booking Platform

Web platform for booking photo shoot sessions — slot selection, payment,
coupons, referrals, and confirmation emails. Built to also render inside a
Flutter WebView for app store distribution.

Repo name is a placeholder; a final product name is still to be decided.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript, Tailwind v4)
- **DB / Auth / Storage**: [Supabase](https://supabase.com) (free tier)
- **Payments**: [Cashfree](https://cashfree.com) — UPI is 0% fee, cards ~1.9%
- **Transactional email**: [Resend](https://resend.com)
- **Design system**: `DESIGN.md` at the repo root (MiniMax reference,
  via [getdesign.md](https://getdesign.md)) — point your AI coding
  agent at it before writing any UI.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Resend / Cashfree keys
```

Apply the DB schema in `supabase/migrations/0001_init.sql` via the Supabase
SQL editor or `supabase db push`.

```bash
npm run dev
```

## Project structure

```
src/
  app/            Next.js routes (App Router)
  lib/supabase/    Supabase client helpers (browser + server)
supabase/
  migrations/      SQL schema
DESIGN.md          UI design tokens/reference for coding agents
.env.example        Required environment variables
```

## Status

- [x] Project scaffold + design tokens wired in
- [x] DB schema: services, slots, bookings, payments, coupons, referrals
- [ ] Booking flow UI (browse services → pick slot → checkout)
- [ ] Cashfree payment integration + webhook handler
- [ ] Booking confirmation email (Resend)
- [ ] Coupon redemption logic
- [ ] Referral code generation + tracking
- [ ] SEO: sitemap, robots.txt, LocalBusiness schema
- [ ] Meta Pixel + GA4
