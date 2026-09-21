-- Lets photographers create their own bookable listings, not just the
-- admin. A service with photographer_id set is a marketplace listing;
-- null means it's an admin-owned generic service (existing behavior,
-- unchanged - the slot-based booking flow still works exactly as before
-- for these).
alter table services add column if not exists photographer_id uuid references photographers(id) on delete cascade;

-- Free-form bookings (against a photographer's own service) don't use a
-- pre-generated slot at all - the customer requests any date/time, and
-- the photographer accepts or declines based on their own availability.
alter table bookings alter column slot_id drop not null;
alter table bookings add column if not exists requested_starts_at timestamptz;
alter table bookings add column if not exists requested_duration_minutes int;
alter table bookings add column if not exists service_id uuid references services(id);

-- New status: a free-form booking starts here (photographer hasn't
-- confirmed availability yet) rather than going straight to payment like
-- the slot-based flow does.
alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending_confirmation', 'pending_payment', 'confirmed', 'cancelled', 'refunded'));

-- A booking must have either a slot (old model) or a requested time +
-- service (new model), not neither.
alter table bookings drop constraint if exists bookings_has_time_reference;
alter table bookings add constraint bookings_has_time_reference
  check (slot_id is not null or (requested_starts_at is not null and service_id is not null));

create index if not exists idx_bookings_service on bookings (service_id);
create index if not exists idx_services_photographer on services (photographer_id);

-- Photographers manage their own services, same ownership pattern as
-- portfolio_items.
create policy "photographers manage own services" on services
  for all using (
    photographer_id is not null
    and exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  ) with check (
    photographer_id is not null
    and exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  );

grant insert, update, delete on services to authenticated;

-- Photographers see bookings made against their own services (previously
-- only the customer and service_role could see any booking at all).
create policy "photographers see bookings on their services" on bookings
  for select using (
    exists (
      select 1 from services s
      join photographers p on p.id = s.photographer_id
      where s.id = bookings.service_id and p.user_id = auth.uid()
    )
  );

grant select on bookings to authenticated;
