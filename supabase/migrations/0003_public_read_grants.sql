-- "Automatically expose new tables" is disabled on this project (the
-- recommended setting), so tables created via SQL don't automatically get
-- the base grants Supabase's Data API roles need. RLS policies (see
-- 0001_init.sql) control which ROWS anon/authenticated can see, but
-- Postgres also requires this GRANT before RLS is even evaluated -
-- without it you get "permission denied for table X" regardless of RLS.
--
-- Only services and slots need this: customers browse them directly.
-- bookings/payments/coupons/referrals are written only via server routes
-- using the service_role key, which bypasses RLS and grants entirely, so
-- they intentionally get no anon/authenticated grant here.
grant usage on schema public to anon, authenticated;
grant select on services, slots to anon, authenticated;
