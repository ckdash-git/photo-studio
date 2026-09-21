-- Public bucket for images we've downloaded from Pixabay and re-hosted
-- ourselves - Pixabay's terms don't allow permanent hotlinking of their
-- URLs (and their medium-size URLs expire after 24h anyway), so this is
-- required, not optional.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict do nothing;

create policy "public read site-images" on storage.objects
  for select using (bucket_id = 'site-images');
-- No insert/update policy for anon/authenticated - uploads only happen via
-- the service-role key from the admin image picker.

-- One row per named slot on the site (e.g. 'hero', 'category-portrait').
-- credit_name/credit_url satisfy Pixabay's attribution request ("show
-- your users where images are from").
create table if not exists site_images (
  slot_key text primary key,
  public_url text not null,
  storage_path text not null,
  pixabay_id int,
  credit_name text,
  credit_url text,
  updated_at timestamptz not null default now()
);

alter table site_images enable row level security;
create policy "site images are publicly readable" on site_images
  for select using (true);
grant select on site_images to anon, authenticated;
