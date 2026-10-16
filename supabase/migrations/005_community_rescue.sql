create table if not exists community_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pantry_item_id uuid references pantry_items(id) on delete set null,
  food_name text not null,
  food_category text not null,
  quantity numeric not null check (quantity > 0),
  unit text,
  description text,
  condition text not null check (condition in ('unopened','opened')),
  opened_status text not null default 'unopened' check (opened_status in ('unopened','opened')),
  storage_method text not null check (storage_method in ('refrigerator','freezer','pantry','counter','unknown')),
  freshness_risk integer check (freshness_risk between 0 and 100),
  photo_url text,
  public_latitude double precision not null check (public_latitude between -90 and 90),
  public_longitude double precision not null check (public_longitude between -180 and 180),
  pickup_area text not null,
  pickup_location_name text,
  pickup_start timestamptz not null,
  pickup_end timestamptz not null,
  status text not null default 'available' check (status in ('available','requested','reserved','collected','cancelled','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (pickup_end > pickup_start),
  check (expires_at >= pickup_end)
);

create table if not exists community_rescue_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references community_listings(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','declined','collected','cancelled')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  declined_at timestamptz,
  collected_at timestamptz,
  cancelled_at timestamptz,
  unique (listing_id, requester_id)
);

create index if not exists community_listings_status_expiry_idx on community_listings(status, expires_at);
create index if not exists community_listings_owner_idx on community_listings(owner_id, created_at desc);
create index if not exists community_listings_public_location_idx on community_listings(public_latitude, public_longitude);
create index if not exists community_requests_listing_status_idx on community_rescue_requests(listing_id, status);
create index if not exists community_requests_requester_idx on community_rescue_requests(requester_id, created_at desc);

alter table community_listings enable row level security;
alter table community_rescue_requests enable row level security;

create policy "Owners manage community listings" on community_listings for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Participants read requested listings" on community_listings for select to authenticated
  using (exists (select 1 from community_rescue_requests r where r.listing_id = id and r.requester_id = auth.uid()));
create policy "Requesters create rescue requests" on community_rescue_requests for insert to authenticated
  with check (requester_id = auth.uid() and exists (select 1 from community_listings l where l.id = listing_id and l.owner_id <> auth.uid() and l.status = 'available' and l.expires_at > now()));
create policy "Participants read rescue requests" on community_rescue_requests for select to authenticated
  using (requester_id = auth.uid() or exists (select 1 from community_listings l where l.id = listing_id and l.owner_id = auth.uid()));
create policy "Requesters cancel own requests" on community_rescue_requests for update to authenticated
  using (requester_id = auth.uid()) with check (requester_id = auth.uid());
create policy "Owners update requests for their listings" on community_rescue_requests for update to authenticated
  using (exists (select 1 from community_listings l where l.id = listing_id and l.owner_id = auth.uid()));
