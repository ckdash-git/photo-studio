-- Photographer marketplace, layered onto the existing booking schema.
-- Contact details (phone, email, name) are intentionally NEVER exposed via
-- any public-read policy below - the app layer must never render them on
-- a public profile either. Customers reach photographers only through
-- proposals/messages scoped to a specific requirement (built in a later
-- migration), never directly.

create table if not exists photographers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  display_name text not null,
  bio text,
  city text not null,
  categories text[] not null default '{}', -- e.g. {portrait, wedding, product}
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references photographers(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- A customer's posted job. Kept separate from the existing services/slots
-- model - this is "hire someone for X", not "book my fixed studio slot".
create table if not exists requirements (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references auth.users(id),
  category text not null,
  city text not null,
  event_date date,
  budget_min_inr int,
  budget_max_inr int,
  description text not null,
  status text not null default 'open'
    check (status in ('open', 'closed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references requirements(id) on delete cascade,
  photographer_id uuid not null references photographers(id) on delete cascade,
  quoted_price_inr int not null,
  message text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (requirement_id, photographer_id)
);

create index if not exists idx_portfolio_photographer on portfolio_items (photographer_id);
create index if not exists idx_requirements_status on requirements (status, city, category);
create index if not exists idx_proposals_requirement on proposals (requirement_id);
create index if not exists idx_proposals_photographer on proposals (photographer_id);

alter table photographers enable row level security;
alter table portfolio_items enable row level security;
alter table requirements enable row level security;
alter table proposals enable row level security;

-- Public: browse active photographer profiles and their portfolios (no
-- contact fields exist on these tables at all, so there's nothing to leak).
create policy "active photographer profiles are publicly readable" on photographers
  for select using (is_active = true);
create policy "portfolio items are publicly readable" on portfolio_items
  for select using (true);

-- A photographer manages their own profile and portfolio.
create policy "photographers manage own profile" on photographers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "photographers manage own portfolio" on portfolio_items
  for all using (
    exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  );

-- Requirements: publicly browsable while open (photographers need to find
-- leads), customers manage their own.
create policy "open requirements are publicly readable" on requirements
  for select using (status = 'open');
create policy "customers manage own requirements" on requirements
  for all using (auth.uid() = customer_user_id) with check (auth.uid() = customer_user_id);

-- Proposals: visible to the photographer who made it and the customer who
-- owns the requirement it's on. Nobody else, including other photographers.
create policy "proposal visible to its photographer" on proposals
  for select using (
    exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  );
create policy "proposal visible to requirement owner" on proposals
  for select using (
    exists (select 1 from requirements r where r.id = requirement_id and r.customer_user_id = auth.uid())
  );
create policy "photographers create own proposals" on proposals
  for insert with check (
    exists (select 1 from photographers p where p.id = photographer_id and p.user_id = auth.uid())
  );

grant select on photographers, portfolio_items, requirements, proposals to anon, authenticated;
grant insert, update, delete on photographers, portfolio_items to authenticated;
grant insert, update on requirements to authenticated;
grant insert on proposals to authenticated;
