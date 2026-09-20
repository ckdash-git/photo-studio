-- service_role should already bypass RLS and have full privileges by
-- default in Supabase, independent of the "Automatically expose new
-- tables" toggle (that setting is specifically about the anon/authenticated
-- Data API roles). This migration is defensive insurance in case this
-- project's role privileges were affected too - safe to run even if
-- these grants already exist.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
