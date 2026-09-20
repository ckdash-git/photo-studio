-- Links a booking to a Supabase Auth user, when the customer was logged in
-- at checkout time. Nullable - guest checkout (no account) still works.
alter table bookings add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_bookings_user on bookings (user_id);

-- Customers can read their own bookings once logged in. Guest bookings
-- (user_id is null) stay invisible to everyone except the service_role
-- key, same as before this migration.
create policy "users can read own bookings" on bookings
  for select using (auth.uid() = user_id);

-- Same base-GRANT gotcha as 0003: RLS restricts rows, but the underlying
-- GRANT for the authenticated role was never added since auto table
-- exposure is off on this project.
grant select on bookings to authenticated;
