-- Demo data for local/staging testing. Run after the migrations.
-- Generates a few services and open slots over the next 14 days.

insert into services (name, description, duration_minutes, price_inr) values
  ('Portrait Session', 'Studio portrait shoot, one outfit, 15 edited photos.', 60, 2500),
  ('Family & Kids', 'Relaxed family session, indoor or outdoor.', 90, 4000),
  ('Pre-Wedding Shoot', 'Two locations, two outfits, full edited gallery.', 180, 12000),
  ('Product Photography', 'Studio product shots for e-commerce listings.', 60, 3000)
on conflict do nothing;

-- One slot per service per day at 10am and 3pm IST for the next 7 days.
insert into slots (service_id, starts_at, ends_at)
select
  s.id,
  (current_date + d.day_offset + t.time_offset) at time zone 'Asia/Kolkata',
  (current_date + d.day_offset + t.time_offset + (s.duration_minutes || ' minutes')::interval)
    at time zone 'Asia/Kolkata'
from services s
cross join (select generate_series(1, 7) as day_offset) d
cross join (values ('10:00'::time), ('15:00'::time)) as t(time_offset)
on conflict do nothing;
